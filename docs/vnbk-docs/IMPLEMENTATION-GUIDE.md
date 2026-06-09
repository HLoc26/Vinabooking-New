# vnbk-service — Implementation Guide: closing the gap to monolith parity

**Goal:** make `API/vnbk-service` behave exactly like `API/monolith-service`.
**Inputs:** this guide is the action plan derived from [`ENDPOINT-PARITY.md`](./ENDPOINT-PARITY.md) (the full
endpoint-by-endpoint diff) and [`RECIPE.md`](../../API/vnbk-service/RECIPE.md) (the canonical module pattern).
Every item below cites the parity-report section that justifies it.

> **How to read this.** Work top-down. **Part 1** (regressions in already-converted modules) is small,
> high-impact, and must be done first — those are endpoints vnbk *has* but that behave differently, including
> **two security holes**. **Part 0** builds the cross-cutting plumbing the missing features need. **Parts 2–3**
> add the missing endpoints/domains. **Part 4** sequences the work; **Part 5** is how you *prove* parity.

---

## Scoreboard (from the parity report)

| | Count |
|---|---|
| Monolith endpoints | 52 |
| Covered by vnbk | 35 (5 SAME · 8 minor-diff · **22 DIFFERENT**) |
| Missing in vnbk | 17 logical ops across **6 whole domains + partial gaps** |
| Static-trace confidence (covered slice) | **72%** |

Missing domains: **review, facility, amenity, owner, search, payment**.
Partial gaps inside converted domains: **user-favourites (5), booking entity-reads (1), booking auto-timeout,
accommodation owner-list/drafts/dashboard, publish→Pinecone index**.

---

## Part 0 — Cross-cutting prerequisites (build these first; they unblock everything else)

### 0.1 `RolesGuard` — the single most impactful missing piece 🔴 SECURITY

**Why:** the monolith gates every owner/admin route with `requireRole([ERole.ACCOMMODATION_OWNER])`
(`role.middleware.ts`). vnbk has **no `RolesGuard`** — the `"used by RolesGuard"` comment in
`IUserService.ts:20` is a dangling reference to a guard that was never built. Result (parity report §2.3, §3.7):
a downgraded/suspended owner (profile present, role revoked) can read settings and trigger the **destructive**
`POST /pricing/owners/me/sync-accommodations` and `sync-floor-prices` that the monolith `403`s. Building this
guard fixes ~10 endpoints' authorization at once.

**The data layer already exists:** `IUserService.getRole(id)` is the ported Redis read-through role cache.

**Create `src/http/middleware/RolesGuard.ts`:**
```ts
import { inject, injectable } from "tsyringe";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { USER_SERVICE, type IUserService, ERole } from "@/modules/user"; // via barrel only
import { UnauthorizedError } from "@/shared/error/UnauthorizedError";
import { ForbiddenError } from "@/shared/error/ForbiddenError";

/** Authorizes a request by role. Compose AFTER AuthGuard (needs req.userId). */
@injectable()
export class RolesGuard {
	constructor(@inject(USER_SERVICE) private readonly users: IUserService) {}

	public require(...allowed: ERole[]): RequestHandler {
		return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
			try {
				if (!req.userId) throw new UnauthorizedError("User is not authenticated");
				const role = await this.users.getRole(req.userId);
				if (!allowed.includes(role)) {
					throw new ForbiddenError("Forbidden: You do not have permission to perform this action");
				}
				next();
			} catch (err) {
				next(err);
			}
		};
	}
}
```

**Apply it** in every owner-scoped router (inject `RolesGuard` like `AuthGuard` is injected):
```ts
// PricingRouter / AccommodationRouter / RoomRouter mutation routes
this.router.post("/owners/me/sync-accommodations",
	this.auth.handle,
	this.roles.require(ERole.ACCOMMODATION_OWNER),   // <-- add
	this.controller.syncAccommodations);
```
Routes needing the guard (parity report §3.3, §3.5, §3.7): all `/pricing/owners/*` and
`/pricing/accommodations/:id/sync-floor-prices`; all accommodation mutations
(`POST /accommodations`, `PATCH /accommodations/:id`, `:id/status`, `:id/publish`, `PUT :id/address`,
`PUT :id/facilities`, `PATCH :id/pricing-settings`); all room mutations
(`POST/PATCH/DELETE` under `/rooms`). `ForbiddenError` (403) already exists in `shared/error/`.

> Once the `owner` module (Part 3.1) lands, also re-derive role from `OwnerProfile` where the monolith does.

### 0.2 Queue infrastructure (BullMQ) — for 3 deferred workers

**Why:** the monolith runs 3 BullMQ workers; vnbk ships none. `LoggingBookingTimeoutScheduler` only logs
(parity report §3.6 — PENDING bookings never auto-expire). Reviews' vector/summary pipeline and the
publish→Pinecone index job are also queue-driven.

**Create `src/infrastructure/queue/`:**
```
queue/
  IQueue.ts            # port: enqueue(name, data, opts), remove(jobId)
  BullMqQueue.ts       # @singleton adapter over bullmq Queue (ioredis connection from AppConfig)
  IWorkerHost.ts       # port a module implements to process a queue
  WorkerRegistry.ts    # resolveAll(WORKER_HOST) -> start each bullmq Worker on bootstrap
  queue.tokens.ts      # QUEUE, WORKER_HOST symbols
```
Register `QUEUE → BullMqQueue` in `InfrastructureModule`. Bootstrap (`Application.ts`) resolves
`WorkerRegistry` and starts workers after the HTTP server (mirror how `ROUTER`s are collected).
Each consuming module registers its worker under `WORKER_HOST` (multi-bind) and its producer.

### 0.3 External-service ports (port + `@singleton` adapter, registered in `InfrastructureModule`)

| Port (new) | Adapter | Used by | Monolith source |
|---|---|---|---|
| `infrastructure/search/IEmbeddingProvider.ts` | `GeminiEmbeddingProvider` | search, review-summary | `@google/generative-ai` usage |
| `infrastructure/search/IVectorIndex.ts` | `PineconeVectorIndex` | search, publish-worker, review-vectors | `@pinecone-database/pinecone` usage |
| `infrastructure/payment-gateway/IPaymentGateway.ts` | `PayosGateway` | payment | `@payos/node` usage / `payos.service.ts` |

Pattern: copy `infrastructure/storage/{IObjectStorage,S3Storage}.ts` — interface + `@singleton()` adapter,
add a token to `infrastructure.tokens.ts`, bind in `InfrastructureModule.register`. The deps
(`@google/generative-ai`, `@pinecone-database/pinecone`, `@payos/node`) are already in the monolith
`package.json` — carry them over.

---

## Part 1 — Fix regressions in CONVERTED modules (vnbk has these endpoints but they diverge)

These are NOT new features — they're behavior fixes so existing endpoints match the monolith. Small and fast.
**Do the two 🔴 SECURITY items immediately.**

| # | Endpoint | Fix | Report ref |
|---|---|---|---|
| 1 🔴SEC | `POST /user` | **Ignore `role` from body** — `User.create({ role: ERole.TRAVELLER })`, never `request.role`. (Self-assigns `ACCOMMODATION_OWNER` today.) Also match monolith body `{success:true}` + status **200** (vnbk returns full user + 201). | §3.2 |
| 2 🔴SEC | all owner routes | Apply `RolesGuard` (Part 0.1). | §2.3 |
| 3 | `GET /auth/otp`, `POST /auth/forgot-password` | **Revert response keys to PascalCase** `CodeDeliveryDestination`/`CodeDeliveryMedium` (vnbk camelCased them → clients read `undefined`). Fix in the auth DTO mapper. | §3.1 |
| 4 | `POST /accommodations/:id/publish` | **Change method back `POST`→`PATCH`** (monolith is PATCH; current PATCH clients 404). Also enqueue the Pinecone `PUBLISH_ACCOMMODATION_JOB` (needs Part 0.2 + 3.6). | §3.5 |
| 5 | `GET /accommodations/search` | **Special-case `?type=ALL` → undefined** (return all types, 200). Today `@IsEnum` rejects with 400 — a common client query. Relax the DTO (accept `ALL`, map to undefined in the mapper) instead of `@IsEnum` hard-reject. | §3.5 |
| 6 | `PATCH /bookings/cancel` | **Match monolith body `data={success:true}`** (vnbk returns the full booking; `data.success` vs `data.id` breaks clients). | §3.6 |
| 7 | `POST /bookings/confirm` | **Decision required (parity vs safety).** Monolith enforces *no* ownership and flips *any* status→BOOKED. vnbk added `belongsTo`→403 + PENDING-only→409. For byte-parity, relax to match monolith; **recommended:** keep vnbk's safer behavior but record it as an intentional deviation (it closes a real hole). | §3.6 |
| 8 | `POST /images/:type/:id` | **Wrap body as `data={success:true,images:[...]}`** (vnbk returns the array directly; clients reading `data.images` break). Match status 200 (vnbk uses 201). | §3.4 |
| 9 | `GET /rooms/:id`, `GET /rooms/accommodation/:id`, `GET /rooms/` | Restore monolith read shape: **re-add `remainingQuantity`** (call `IBookingService.getBookedCounts` — booking already exposes it; wire room→booking read for availability), **keep amenity `id` = join-row id** and the raw amenity shape incl. `note`, and **stop attaching `images[]`** on `GET /rooms/:id` (monolith never returns images there). | §3.3 |
| 10 | `DELETE /rooms/:id` | **Return 204 empty body** (vnbk returns 200 `{success:true,data:null}`). | §3.3 |
| 11 | `POST /accommodations` create + `PATCH :id/pricing-settings` | **Restore pricing-range validation + duplicate-`holidayCode` rejection** (vnbk persists out-of-range/duplicate values monolith 400s). Add the bounds to the request DTO / a domain rule. | §3.5 |
| 12 | `GET /user`, `PATCH /user`, `GET /user/me` | Decide whether to **keep `createdAt`/`updatedAt`** (vnbk strips them everywhere). Restore in `UserDtoMapper.toResponse` if clients depend on them. Also re-add `?withFavourites=true` once favourites land (item in Part 2). | §3.2 |
| 13 | cross-cutting | **Surface validation `details[]`** — `ErrorHandlerMiddleware` serializes only `err.message`; include `BadRequestError.details` in the error body if clients need per-field messages (note: monolith had none, so this is optional for strict parity). | §2.1 |

> Items 7 and 12 are genuine "monolith was wrong / leaner" cases — flag them to the team and decide
> parity-vs-improvement per endpoint rather than blindly matching.

---

## Part 2 — Missing features inside converted modules

### 2.1 User favourites (5 endpoints) — `modules/favourite` (or under `user`)
**Monolith:** `FavouriteService` (`02-22`), `FavouriteRepository` (`01-23`), `routes/user.routes.ts` favourites block.
**Missing routes:** `POST /user/favourites`, `DELETE /user/favourites`, `PATCH /user/favourites/:id`,
`POST /user/favourites/accommodation`, `DELETE /user/favourites/accommodation`.
**Target:** a `modules/favourite/*` slice (per RECIPE) or a sub-feature of `user`. The default list on sign-up
already exists (`UserEntityMapper.toCreateInput`). Enforce list ownership (the monolith does). Mount the routes
under `/user/favourites` (router can register the sub-paths).

### 2.2 Booking entity-reads — `GET /bookings`
**Monolith:** `booking.controller.getBookings` (by accommodation/user/room/booking id; **no** ownership check).
**Add to vnbk:** `IBookingService.getBookingById/ByUserId/ByAccommodationId/ByRoomId` + a `BookingController.list`
+ route. DAO methods exist conceptually (`BookingDao`); add the finders returning domain `Booking[]`, map via
`BookingDtoMapper`. (Decide whether to keep the monolith's no-ownership behavior.)

### 2.3 Booking auto-timeout — replace the stub with a real worker
**Now:** `LoggingBookingTimeoutScheduler` only logs.
**Do:** with Part 0.2, implement `BullMqBookingTimeoutScheduler implements IBookingTimeoutScheduler` that enqueues
a delayed job on `create`/`draft` and removes it on confirm/cancel; add a `BookingTimeoutWorker` (WORKER_HOST) that
calls `IBookingService.cancel(id, { source: SYSTEM })` when the job fires. Bind in `BookingModule`.

### 2.4 Accommodation owner reads + publish index
**Missing (parity §3.5, §3.11):** `GET /owners/accommodations` (getOwnerAccommodations),
`GET /owners/accommodations/drafts`, `GET /owners/accommodations/:id/draft` (draft hydration + `calculateWizardStep`),
`getCapacityByOwnerId`. These belong with the **owner** module (Part 3.1) as read services that call
`IAccommodationService`. Also wire the publish→Pinecone enqueue (Part 1 item 4 + Part 3.6).

---

## Part 3 — Missing domains (build each as a RECIPE module)

For every domain: create the folder tree from `RECIPE.md`, add `<name>.tokens.ts` (Symbols), a
`<Name>Module implements IModule` (register repo→dao, service→impl, `ROUTER`→router; subscribe event handlers),
an `index.ts` barrel, and append `new <Name>Module()` to `Application.modules`. Repositories return domain models;
DAOs extend `BaseDao`.

### 3.1 Owner — **build first** (unblocks role-upgrade, RolesGuard data, owner reads) 🔴
**Monolith:** `owner.repository.ts`, `owner.service.ts`, `owner.controller.ts`, `owner.routes.ts`.
**Endpoints:** `POST /owners/upgrade` (🔴 transactional `OwnerProfile` create + `User.role`→`ACCOMMODATION_OWNER` +
Redis role-cache bust — *blocks the entire owner lifecycle if absent*), `GET /owners/profile/me`,
`GET /owners/bookings` (enriched + filters), `PATCH /owners/bookings/:bookingId/revoke`,
`GET /owners/dashboard/stats`.
**Target:** `modules/owner/*`. The role-upgrade touches `user` (promote role) + `auth`/Cognito — use
`IUserService` via barrel. Dashboard/owner-bookings is cross-domain read → a query service over
`IBookingService` + `IRoomService` + `IAccommodationService` (CQRS-lite read DTOs). Revoke = owner-side cancel
(owner-ownership + PENDING|BOOKED guard) — distinct from the traveller `PATCH /bookings/cancel`.

### 3.2 Facility — simplest, good warm-up
**Monolith:** `facility.repository.ts`, `facility.controller.ts`, `facility.routes.ts`.
**Endpoint:** `GET /facilities/` (global catalog). **Target:** `modules/facility/*`. The
accommodation↔facility *join* (`FacilityConfig`) already lives in `modules/accommodation`; you only need the
master-catalog read. Copy the `user` module shape.

### 3.3 Amenity — simplest
**Monolith:** `amenity.repository.ts`, `amenity.controller.ts`, `amenity.routes.ts`.
**Endpoint:** `GET /amenities/` (ordered by type; powers room-creation dropdowns). **Target:** `modules/amenity/*`.
`Amenity`/`AmenityConfig` domain already mirrored under `modules/room`; add the flat list-all.

### 3.4 Review — event-driven AI summary
**Monolith:** `review.repository.ts` (Sang), `review.service.ts` + controller + routes (Huy), AI-summary (Lộc).
**Endpoints:** `POST /reviews` (booking-COMPLETED gating + owner-reply gating + Redis review counter),
`GET /reviews/accommodation/:accommodationId` (nested + user enrichment),
`GET /reviews/booking/:bookingId/me`.
**Target:** `modules/review/*`. **Integration:** on create, publish a `ReviewCreatedEvent`; a review-summary
worker (Part 0.2/0.3) handles `PROCESS_TO_VECTORS` + `SUMMARIZE_REVIEWS` via the Gemini/Pinecone ports —
no direct service→worker call. **Note (§3.8):** vnbk's `AccommodationDao` already *reads* `Review` for
avgStar/reviewCount, so until this lands those stay `0`.

### 3.5 Payment — PayOS + event-based booking link
**Monolith:** `payos.service.ts`/PayOS client, `payment.service.ts`, `payment.repository.ts`, controller, routes.
**Endpoints:** `POST /payments/create` (PayOS link + PENDING `PaymentTransfer`), `POST /payments/webhook`
(signature verify → `PaymentTransfer`→COMPLETED; keep the intentional **always-200** anti-retry contract),
`GET /payments/verify` (idempotent COMPLETED write — **🔴 contains the only payment-driven `confirmBooking`
call**, `payment.service.ts:174`).
**Target:** `modules/payment/*` + `IPaymentGateway` port (Part 0.3). **Integration:** the monolith's
"fail PENDING PaymentTransfers when a booking is cancelled" becomes a handler subscribed to
**`BookingCancelledEvent`** (already published by booking) — no booking↔payment coupling. `verify` calls
`IBookingService.confirm` to restore the payment-driven confirmation path.

### 3.6 Search — Gemini + Pinecone + publish worker
**Monolith:** `search.service.ts`, `search.controller.ts`, `search.routes.ts`; the publish-index job.
**Endpoint:** `GET /search/semantic` (Gemini embedding → Pinecone dual vector query, geo-bounded → weighted
scoring → Redis 600s cache → DB enrichment). Explicitly deferred at `AccommodationServiceImpl.ts:244`.
**Target:** `modules/search/*` over `IEmbeddingProvider` + `IVectorIndex` + `ICacheService` (Part 0.3).
**Publish worker:** a `PublishAccommodationWorker` (WORKER_HOST) handling the `PUBLISH_ACCOMMODATION_JOB`
enqueued by `POST/PATCH /accommodations/:id/publish` (Part 1 item 4) — (re)indexes into Pinecone.

---

## Part 4 — Suggested sequencing & owner attribution

Dependency-ordered (each unblocks the next):

1. **`RolesGuard`** (Part 0.1) + **Part 1 security fixes #1/#2** — *immediate*, closes the two holes. — LOC/HUY
2. **Part 1 behavior fixes #3–#13** — quick wins, restore client-observable parity. — owner per module
3. **Owner module** (3.1) — unblocks role-upgrade + owner reads + RolesGuard role source. — HUY
4. **Queue infra** (0.2) + **external ports** (0.3) — plumbing for workers. — LOC
5. **Facility (3.2), Amenity (3.3)** — simplest, parallelizable. — HUY
6. **Favourites (2.1), Booking reads (2.2), Booking timeout (2.3)** — within converted modules. — SANG
7. **Review (3.4)** — needs events + Gemini/Pinecone. — SANG (data) + HUY (REST) + LOC (AI)
8. **Payment (3.5)** — needs PayOS port + `BookingCancelledEvent`. — SANG
9. **Search (3.6) + publish worker + Pinecone index** — needs Gemini/Pinecone. — LOC

Attribution mirrors the monolith's original authorship (see `01/02/03-*.md` member docs and `COMMIT-PLAN.md`).

---

## Part 5 — Verify parity (don't trust static analysis alone)

The 72% confidence is *static-trace* only. Per `ENDPOINT-PARITY.md` §6, runtime concerns (real Cognito JWT,
S3 bytes, email, **pricing `quoteHash` numeric output**, raw-SQL search results, Redis/BullMQ/Pinecone side
effects, PayOS) were read, not executed. To actually prove parity, run a **parallel-run diff**:

1. Stand up monolith `:8080` + vnbk `:8081` against the **same seeded DB**.
2. **Golden-request corpus** — replay captured requests against both; diff `(status, canonicalized body)`,
   normalizing timestamps/ids/ordering. Surfaces every shape/status/rename divergence with real payloads.
3. **Auth matrix** — each owner endpoint with: no token / traveller / owner / owner-with-revoked-role →
   confirms the 403-vs-404/200 role gap and the `POST /user` escalation are fixed.
4. **Pricing oracle** — identical `/pricing/quote` inputs to both; assert `quoteHash` + every numeric field
   equal across a fuzzed date/discount/holiday grid (the only way to prove the engine port is byte-identical).
5. **Side-effect probes** — after confirm/cancel/publish/payment, inspect DB rows, Redis keys, queue jobs,
   S3 objects, captured email/PayOS calls.
6. **Negative corpus** — extra fields, bad enums, out-of-range pricing, empty bodies, `?type=ALL`,
   `?withFavourites=true` — quantify validation-strictness and dropped-feature divergences.

Gate the cutover on this diff going green for each endpoint.

---

*Companion docs: [`ENDPOINT-PARITY.md`](./ENDPOINT-PARITY.md) (the diff) · [`RECIPE.md`](../../API/vnbk-service/RECIPE.md)
(module pattern) · [`01-loc-*`](./01-loc-platform-identity-intelligence.md) / [`02-sang-*`](./02-sang-room-booking-payment.md) /
[`03-huy-*`](./03-huy-accommodation-owner-content.md) (per-member ownership).*
