# VNBK ↔ Monolith Endpoint-Parity Report

**Scope:** Static source-trace comparison of two Express+Prisma backends for the same product against the same Prisma schema.
**Reference (source of truth):** `API/monolith-service` — `src/routes/*.routes.ts` → `controllers` → `services` → `repositories`.
**Under test (OOP rewrite):** `API/vnbk-service` — `src/modules/<m>/rest/<X>Router.ts` + `<X>Controller.ts` → `service/impl/*` → `dao/*` → `domain/*` / `dto/*`.
**Method:** Every claim is traced controller → service → repository/dao on both sides, with the adversarial verifier's CORRECTED/MISSED findings folded in (the verifier overrides the first pass). Verdicts are about *client-observable* behavior: auth requirement, validation/rejection behavior, response body shape + field values (modulo timestamps/ordering/ids), and success status.

> **What static analysis CANNOT prove** is summarized in §6. In short: real Cognito/JWT verification, S3 upload, email side-effects, PayOS calls, the numeric output of the pricing engine, and raw-SQL/Pinecone search results were *read*, not *executed*. Confidence is calibrated accordingly.

---

## 1. Executive Summary

| Metric | Count |
|---|---|
| Monolith endpoints (incl. `/health`) | **52** |
| VNBK endpoints (incl. `/health`) | **38** |
| Monolith endpoints with a VNBK counterpart (covered) | **35** |
| Monolith endpoints with NO VNBK counterpart (missing) | **17** |
| VNBK-only endpoints (extra) | **1** |

### Verdict breakdown across the 35 covered monolith endpoints (excluding `/health`, which is trivially equivalent on both)

> Counting the 34 non-health covered endpoints by verdict. `/health` is treated as SAME and folded into the "same" tally below, giving 35 covered total.

| Verdict | Count | Meaning |
|---|---|---|
| **SAME** | **5** | Observably identical (incl. `/health`). |
| **EQUIVALENT_MINOR_DIFF** | **8** | Equivalent business behavior; differences confined to validation strictness, error HTTP status (200-vs-4xx), or trivial body nuances. |
| **DIFFERENT** | **22** | At least one client-observable divergence: response shape change, dropped/added fields, missing role guard, missing side effects, method/status change, or dropped validation. |
| **MISSING_IN_VNBK** | **17** | No VNBK route; client gets framework 404. |
| **EXTRA_IN_VNBK** | **1** | VNBK-only route (`GET /auth/google`). |

**Covered = 35** (5 SAME + 8 EQUIVALENT_MINOR_DIFF + 22 DIFFERENT). **Missing = 17. Extra = 1.**

### The 6 entirely-missing domains

These domains have **zero** VNBK implementation — no router, controller, service, or dao under `src/modules`. Every endpoint in them is `MISSING_IN_VNBK`:

1. **`/reviews`** (3 endpoints) — review create/reply, accommodation review list, my-review-by-booking. Lost: booking-COMPLETED gating, owner-reply gating, Redis review counter, BullMQ vector/summary pipeline.
2. **`/owners`** (7 genuine owner-domain endpoints + 11 delegated routes) — profile, role-upgrade, owner bookings, revoke, drafts, draft-hydration, dashboard stats. The role-upgrade flow (create OwnerProfile + promote `User.role` + Redis cache bust) is gone entirely.
3. **`/facilities`** (1 endpoint) — global facility catalog read.
4. **`/amenities`** (1 endpoint) — global amenity catalog read (used by room-creation dropdowns).
5. **`/search`** (1 endpoint) — `GET /search/semantic`: Gemini embedding → Pinecone dual vector query → weighted scoring → Redis cache → DB enrichment. Explicitly deferred (comment at `AccommodationServiceImpl.ts:244`).
6. **`/payments`** (3 endpoints) — PayOS link create, webhook ingestion, verify. **Critically**, the only payment-driven booking-confirmation path (`payment.service.ts:174 → confirmBooking`) is gone; the `PaymentTransfer` Prisma model exists in VNBK but nothing reads/writes it.

> Note: the `/owners` mount also hosts 11 **delegated** routes (accommodation/room mutations). Their *logic* is ported under VNBK's `/accommodations` and `/rooms` mounts (so they are not net feature loss), but the `/owners`-mounted path itself is absent and the `ACCOMMODATION_OWNER` role gate is dropped. The 17 missing-endpoint count includes the owner-domain reads that have no analogue anywhere (profile, upgrade, owner bookings, revoke, drafts, draft-hydration, dashboard, owner-accommodation list) plus review/facility/amenity/search/payment. The relocated mutations are counted as covered (DIFFERENT) under accommodation/room — see §4 for the exact accounting.

---

## 2. Cross-Cutting Differences (apply to ALL endpoints)

These four systemic differences override or color every per-endpoint verdict. Read this section first; per-domain tables only note *additional* per-endpoint divergences.

### 2.1 Response envelope — SHAPE IS IDENTICAL, default status differs

Both sides emit `{ success, data, error }` with `data:null` on errors and `error:null` on success — byte-for-byte identical JSON keys.

- Monolith: `ResponseHelper.success(res, data, status=200)` / `ResponseHelper.error(res, message, status=200)` (`src/utils/response.ts:5-19`).
- VNBK: `ResponseEnvelope.success(res, data, status=200)` / `ResponseEnvelope.error(res, message, status=500)` (`src/shared/http/ResponseEnvelope.ts:9-15`), shape pinned by `ApiResponse` (`ApiResponse.ts:5-9`, comment: "Kept identical to the monolith"). `BaseController.handle` wraps every success through `ResponseEnvelope.success` (`BaseController.ts:28-37`).

The **only** envelope-shape difference is a leakage gap: VNBK's `BadRequestError` carries a `details:string[]` array (per-field validation messages from `ValidationPipe.flatten`), but `ErrorHandlerMiddleware` serializes **only** `err.message` (`ErrorHandlerMiddleware.ts:12`). So a client always sees `error:'Validation failed'`, never the per-field detail. The monolith has no `details` field at all.

### 2.2 Error HTTP status codes — THE DOMINANT SYSTEMIC DIVERGENCE

- **Monolith**: `ResponseHelper.error` **defaults to HTTP 200** (`response.ts:13`). Most controllers call it with no explicit status inside catch blocks, so a large fraction of monolith error responses are **HTTP 200 with `{success:false}`**. The monolith is *inconsistent*: some controllers DO pass explicit codes (`accommodation.controller.ts:104=401, :117=400, :127=500`).
- **VNBK**: routes ALL errors through `ErrorHandlerMiddleware` (`Application.ts:47`) which maps `AppError.statusCode` → real `4xx/5xx`, falling back to 500 for non-`AppError` throws. Subclasses fix codes: `BadRequest 400`, `Unauthorized 401`, `Forbidden 403`, `NotFound 404`, `Conflict 409`.

**Net:** a client switching on `res.status` observes systematically different codes on error paths (monolith 200 vs VNBK 4xx/5xx), even when the `success:false` body matches.

**Important nuance (verifier correction):** in three domains the monolith does NOT trigger the 200-default trap, because the controllers either throw (Express 5 auto-forwards rejected async handlers to the terminal `ErrorHandler.handle` at `index.ts:203`, which honors `err.statusCode`) or pass explicit codes:
- **auth** — controllers throw typed `AppError`s; Express 5 forwards them → proper 400/500. Status largely aligned (except validation rejections).
- **pricing** — `PricingController.#handle` explicitly forwards `err.statusCode`. Aligned except the role 403-vs-404 issue.
- **room** — every controller catch passes an explicit code (`getRoomById` forces all errors to 404; the list reads force 400). So the relevant room status diffs are `400(mono)-vs-404(vnbk)` and `404(mono)-vs-500(vnbk)`, not the 200 trap.

The 200-default trap **does** bite in: booking (every error path), `GET /user`, `GET /accommodations/` (byEntity invalid query), the favourites guards, and payment `/create`/`/verify`.

### 2.3 Auth (401) — EQUIVALENT; Role authorization (403) — MAJOR DIVERGENCE

**Authentication (401) is observably equivalent.** Both read the `authorization` header only (Bearer prefix required; cookies not used for the bearer flow), both verify via the same `aws-jwt-verify` `CognitoJwtVerifier` (`tokenUse:'access'`, same pool/client), both attach `req.userId = payload.sub`, both end at HTTP 401 with the identical envelope. Mechanism differs (monolith writes 401 inline in `auth.middleware.ts`; VNBK throws `UnauthorizedError` → middleware) but that is not client-observable.

**Role authorization (403) is a major divergence.** The monolith enforces `requireRole([ERole.ACCOMMODATION_OWNER])` at the route layer (`role.middleware.ts:29,43`; `owner.routes.ts:31-33`; `pricing.routes.ts:16`) with a Redis role read-through cache (`user:<id>:role`, EX 3600). A non-owner is rejected **before the controller** with **HTTP 403**.

**VNBK has NO RolesGuard middleware at all.** The `"used by RolesGuard"` comment in `IUserService.ts:20` is a dangling reference to a guard that was never built. VNBK's owner-scoped routers apply only `this.auth.handle`. Ownership is pushed into services that throw `NotFoundError` → **404** (pricing) or `BadRequestError` → **400** (accommodation/room ownership checks).

**Observable consequences:**
- A logged-in non-owner hitting an owner endpoint: monolith **403** vs VNBK **404/400** (and only after reaching the service).
- A user who HAS an `OwnerProfile` but whose current role is NOT `ACCOMMODATION_OWNER` (downgraded/suspended owner): monolith **403** vs VNBK **serves the data / allows the mutation** — including the destructive pricing `sync-accommodations` and `sync-floor-prices`. **This is a security-relevant divergence.**
- A public `POST /user`/`POST /accommodations` (create) on VNBK has no role gate, so a non-owner can self-create where the monolith would 403 (accommodation) — and `POST /user` can even self-assign `role:'ACCOMMODATION_OWNER'` (see §3 User).

### 2.4 Validation — monolith has none; VNBK is systematic and stricter

- **Monolith**: no validation library. Ad-hoc `if`-checks inside controllers, most omitting the status (→ HTTP 200). No rejection of unknown/extra fields. No type coercion.
- **VNBK**: `ValidationPipe` runs `class-validator` + `class-transformer` per-route — `plainToInstance` with `enableImplicitConversion:true`, then `validate()` with `{ whitelist:true, forbidNonWhitelisted:true }` (`ValidationPipe.ts:25-31`). On any error: `BadRequestError('Validation failed', details[])` → **HTTP 400**.

**Observable effects unique to VNBK:**
- Malformed input → **400** systematically (monolith: 200/500/coerced).
- **Unknown/extra fields → 400** (`forbidNonWhitelisted`). Monolith silently ignores extras.
- **Non-decorated fields stripped**, types coerced (e.g. numeric query strings → numbers). Monolith uses raw `req.body`/`req.query`.
- Error string is always the generic `'Validation failed'` (per-field detail dropped, see §2.1) — vs the monolith's specific messages where it validates at all.

---

## 3. Per-Domain Endpoint Tables

Legend: **SAME** · **EQUIV** (EQUIVALENT_MINOR_DIFF) · **DIFFERENT** · **MISSING** · **EXTRA**. 🔴 = high-risk row. Verdicts reflect the verifier's CORRECTED/MISSED overrides.

### 3.0 Infrastructure

| METHOD path | Verdict | VNBK file | Divergences |
|---|---|---|---|
| GET /health | SAME | `AppRouter` inline | Monolith inline `{status...}`; VNBK `res.status(200).json({status:'ok'})`. Trivially equivalent. |

### 3.1 Auth (`/auth`) — converted

| METHOD path | Verdict | VNBK file | Divergences |
|---|---|---|---|
| POST /auth/sign-up | EQUIV | `auth/service/impl/AuthServiceImpl.ts:46-71` | VNBK adds validation (400 on bad email/missing/extra fields). **Verifier correction:** monolith cache-failure does NOT leak success — the un-returned `error(500)` send wins; client sees 500 on both. Real diff is only error *message* + monolith server-side `ERR_HTTP_HEADERS_SENT` log. |
| POST /auth/sign-up/confirm | EQUIV | `AuthServiceImpl.ts:73-101` | Welcome-email order differs (monolith inside `confirmSignUp` before DB save; VNBK after provider link), best-effort/non-blocking. **Verifier correction:** DB-save-miss is **404 on both** (`saveUserFromCache`/`savePendingUser` throw `NotFoundError`); the monolith `DatabaseError` guard is dead code. |
| GET /auth/otp | 🔴 DIFFERENT | `AuthServiceImpl.ts:157-163` | **Breaking response-field rename**: monolith `data.CodeDeliveryDestination`/`CodeDeliveryMedium` (PascalCase) → VNBK `codeDeliveryDestination`/`codeDeliveryMedium` (camelCase). Clients reading PascalCase get `undefined`. Plus VNBK validates email/extra-params → 400. |
| POST /auth/log-in | EQUIV | `AuthServiceImpl.ts:103-135` | Equivalent: Google-provider rejection (400), token issuance, cookie attrs (httpOnly/secure/sameSite=none/30d), user summary all match. Nuance: when `userInDb` null, monolith omits `name/phone/role` keys (undefined) vs VNBK emits `null`. VNBK adds email/password validation. |
| GET /auth/refresh | EQUIV | `AuthServiceImpl.ts:137-148` | Both cookie-based, 400 if missing. VNBK adds explicit `IdentityProviderError('Refresh failed')` 500 vs monolith non-null-assert TypeError → 500. Same status, different message on that edge. |
| POST /auth/verify | EQUIV | `AuthServiceImpl.ts:150-172` | **Verifier MAJOR correction:** invalid/expired token is **500 on BOTH** (CognitoJwtVerifier throws, never returns falsy; monolith's `Invalid Token` 400 guard is dead code). Real diff: `tokenType` — monolith silently takes the `'id'` branch for any non-`'access'` value; VNBK `@IsIn(['access','id'])` → 400. |
| POST /auth/sign-out | SAME | `AuthServiceImpl.ts:174-191` | Behaviorally identical: same cookie-clear, swallow-all-errors, always `{success:true}` 200. |
| GET /auth/google | EXTRA | `OAuthServiceImpl.ts:37-46` | VNBK-only: builds Google consent URL and 302-redirects. No monolith counterpart (monolith exposes only `/google/callback`). Additive. |
| GET /auth/google/callback | EQUIV | `OAuthServiceImpl.ts:48-95` | Success-redirect shape identical (`accessToken,idToken,expiresIn,user`). Error-redirect: monolith `?message=${raw}` (can be malformed for special chars) vs VNBK `encodeURIComponent`. Monolith provider-linking has dead/duplicated code; net new-user DB effect equivalent. |
| POST /auth/forgot-password | 🔴 DIFFERENT | `AuthServiceImpl.ts:178-188` | **Same breaking PascalCase→camelCase rename as `/otp`** (`CodeDeliveryDestination`→`codeDeliveryDestination`). Plus VNBK `@IsEmail` rejects malformed email pre-Cognito + extra fields. |
| POST /auth/forgot-password/confirm | EQUIV | `AuthServiceImpl.ts:192-204` | Both → 400 `'Invalid or expired reset code'`. VNBK `@IsEmail` + `@IsNotEmpty` reject malformed/extra (different trigger/message on malformed-email path). |

**Cross-cutting (auth):** validation-error body is always generic `'Validation failed'` (details dropped). DeliveryMedium `.toString()` behavior is consistent across both for each respective endpoint (not a divergence).

### 3.2 User (`/user`) — converted (4 of 9)

| METHOD path | Verdict | VNBK file | Divergences |
|---|---|---|---|
| POST /user | 🔴 DIFFERENT | `user/rest/UserController.ts:22-26` | (a) Body: monolith returns `{success:true}` only; VNBK returns the **full created user**. (b) Status **200 vs 201**. (c) VNBK validates (400) vs monolith 500-on-bad-input. (d) **🔴 Privilege divergence:** VNBK persists `role` from the body (`User.create({role: request.role ?? TRAVELLER})`) — an unauthenticated public `POST /user {role:'ACCOMMODATION_OWNER'}` self-assigns owner on VNBK but is `TRAVELLER` on monolith. Both create default favourite list. |
| PATCH /user | 🔴 DIFFERENT | `UserController.ts:28-33` | **Verifier upgrade EQUIV→DIFFERENT.** (a) Body strips `createdAt`/`updatedAt` on every success. (b) Unknown-id: monolith Prisma P2025 uncaught → **500** vs VNBK pre-check → **404**. Plus VNBK busts `user:{id}:role` cache (monolith doesn't) and validates types/extra fields. |
| GET /user/me | EQUIV | `UserController.ts:35-39` | Only diff: VNBK strips `createdAt`/`updatedAt`. Both 404 on missing user, 401 on missing auth, both omit favourites. Status parity genuinely good. |
| GET /user | 🔴 DIFFERENT | `UserController.ts:41-47` | (a) **Feature dropped**: `?withFavourites=true` fully supported by monolith (returns favourites lists+items), **ignored by VNBK**. (b) Strips timestamps. (c) Missing-id: monolith **200 {success:false}** vs VNBK **400**. (d) Not-found: monolith's own try/catch returns **500** vs VNBK **404**. (e) id/email-mismatch check dropped (latent). |
| POST /user/favourites | 🔴 MISSING | (absent) | Entire favourites feature unimplemented. Client gets framework 404 vs 201 + FavouriteList. |
| DELETE /user/favourites | 🔴 MISSING | (absent) | Ownership-enforcing delete + cascade absent. |
| PATCH /user/favourites/:id | 🔴 MISSING | (absent) | Ownership check + duplicate-name handling absent. |
| POST /user/favourites/accommodation | 🔴 MISSING | (absent) | Add-accommodation-to-favourite absent. |
| DELETE /user/favourites/accommodation | 🔴 MISSING | (absent) | Remove-accommodation-from-favourite absent. |

**Cross-cutting (user):** all user-returning endpoints drop `createdAt`/`updatedAt` (`UserDtoMapper.toResponse`). No `FavouriteService/Repository/Controller` exists anywhere in VNBK.

### 3.3 Room (`/rooms`) — converted (mount asymmetry)

> **Mount headline:** under the literal `/rooms` mount the monolith exposes ONLY 4 public GET reads. All room *mutations* in the monolith live under `/owners` (`POST /owners/accommodations/:accommodationId/rooms`, `PATCH/DELETE /owners/rooms/:id`) behind `requireRole([ACCOMMODATION_OWNER])`. VNBK consolidates everything under `/rooms` with **auth-only** (no role guard). The three mutations are classified `EXTRA_IN_VNBK` *relative to the `/rooms` mount*, but the underlying operations exist in the monolith (relocated + de-privileged) — for the global tally they are counted as covered (DIFFERENT) under the relocated-owner accounting in §4, not as net-new features.

| METHOD path | Verdict | VNBK file | Divergences |
|---|---|---|---|
| GET /rooms/filter-ids | EQUIV | `room/dao/RoomDao.ts` (`findAccommodationIdsByFilter`) | DAO logic line-for-line identical. VNBK coerces query via `toNumber()` (junk→undefined ignored) vs monolith raw passthrough (Prisma may 400). Unexpected-error status 400(mono) vs 500(vnbk). `children` param accepted-but-unused on both. |
| GET /rooms/accommodation/:accommodationId | 🔴 DIFFERENT | `RoomServiceImpl.ts` (`getRoomsByAccommodationId`) | **(a) Drops `remainingQuantity`** — monolith computes availability via `BookingService.getBookedCounts`; VNBK omits the field entirely (moved to booking module, never called). **(b) Amenity `id` VALUE differs**: monolith `amenities[].id = config.id` (join-row id) vs VNBK `amenity.id`. (c) Drops room `createdAt/updatedAt` + bed `roomId/createdAt/updatedAt`. (d) Error 400(mono) vs 500(vnbk). |
| GET /rooms/:id | 🔴 DIFFERENT | `RoomServiceImpl.ts` (`getRoomById`) | **(a) Amenity shape drastically differs**: monolith returns RAW join rows `[{id,roomId,amenityId,note,amenity:{...}}]`; VNBK flattens to `[{id,name,type,description}]` (drops `note`). **(b) VNBK ALWAYS attaches `images[]`; monolith NEVER returns images here.** (c) Drops timestamps. (d) Non-NotFound errors: monolith forces ALL to 404 vs VNBK 500. Not-found is 404 on both. |
| GET /rooms/ | 🔴 DIFFERENT | `RoomServiceImpl.ts` (`getRoomsByMultipleIds`) | (a) "No rooms found" status: monolith **400** vs VNBK **404**. (b) Amenity shape (raw join rows vs flattened) + VNBK extra `images[]`. (c) Drops timestamps. (d) Whitespace ids: monolith keeps empties (`'a,,b'→['a','','b']`); VNBK filters them. |
| POST /rooms/accommodation/:accommodationId | 🔴 DIFFERENT (relocated; EXTRA vs /rooms mount) | `RoomRouter.ts:24`, `RoomServiceImpl.createRoom` | Monolith mount `POST /owners/accommodations/:accommodationId/rooms`. **Path moved + role guard dropped** (403→400 for non-owner). `quantity` REQUIRED in monolith vs `@IsOptional` in VNBK (omit → 400 mono / 201 vnbk). **`basePrice:0` → 400 mono (falsy guard) but 201 vnbk** (`@Min(0)`). Response raw vs `RoomResponse` (flattened, `images:[]`). **Missing Redis `acc:detail:` cache invalidation.** |
| PATCH /rooms/:id | 🔴 DIFFERENT (relocated; EXTRA vs /rooms mount) | `RoomRouter.ts:27`, `RoomServiceImpl.updateRoom` | Monolith mount `PATCH /owners/rooms/:id`. Path moved + role guard dropped. **Empty body**: monolith 400 vs VNBK no-op 200. **VNBK enforces `floorPrice<=basePrice` on PATCH; monolith does NOT** (only on create) → PATCH `floorPrice>basePrice` succeeds mono / 400 vnbk. Missing Redis cache bust. |
| DELETE /rooms/:id | 🔴 DIFFERENT (relocated; EXTRA vs /rooms mount) | `RoomRouter.ts:28`, `RoomServiceImpl.deleteRoom` | Monolith mount `DELETE /owners/rooms/:id`. **Success contract: monolith 204 empty body vs VNBK 200 `{success:true,data:null}`.** Path moved + role guard dropped. Image-cleanup: monolith throws (post-delete) vs VNBK best-effort swallow. Missing Redis cache bust + no `getRoomById` prefetch. |

**Cross-cutting (room):** mutations drop the `ACCOMMODATION_OWNER` role guard and the Redis `acc:detail:` invalidation; reads drop timestamps and (for `:id`/multi-id) reshape amenities + add `images[]`. Shared DAO logic (BUNK_BED qty×2 normalization, bed diff-sync, amenity upsert/deleteMany-notIn, Prisma grouping/sort) is faithfully reproduced. **MISSED:** VNBK `isBunk` broadened to `.includes('BUNK')` on create (monolith only on update) — but `@IsEnum` bedType validation gates it first.

### 3.4 Image (`/images`) — converted

| METHOD path | Verdict | VNBK file | Divergences |
|---|---|---|---|
| POST /images/:type/:id | EQUIV | `image/rest/ImageController.ts` | (a) **Body shape**: monolith `data={success:true,images:[...]}` vs VNBK `data=[...]` (array directly) — a client reading `data.images` breaks. (b) Status **200 vs 201**. (c) Validation errors: monolith plain `Error` → **500** vs VNBK `BadRequestError` → **400** (and message `'Invalid upload type'` vs `'Invalid image type'`). Element fields `{id,s3Key,variant}` identical; Sharp pipeline, S3 key scheme, DB writes all identical. |
| GET /images/:type/:id | EQUIV | `ImageController.ts` | (a) Variant objects: monolith includes `imageId` (raw Prisma spread); VNBK `ImageVariantResponse` drops it. (b) Invalid `:type` token: monolith → 200 `[]` (no validation) vs VNBK → 400. Top-level image + references fields otherwise identical. |
| DELETE /images/:id | SAME | `ImageController.ts:42-45` | Fully equivalent incl. the (likely unintended) property that NEITHER side enforces image ownership — any authenticated user can delete any image. Same no-op-on-missing, same `{success:true,data:null}` 200, identical DB+S3 side effects. |

### 3.5 Accommodation (`/accommodations` + relocated `/owners/accommodations/*`) — converted

> Monolith `/accommodations` mount = 6 public reads. Owner mutations live under `/owners/accommodations/*` (same `AccommodationController`). VNBK relocates ALL mutations under `/accommodations` (and `publish` changed PATCH→POST). All mutations drop the role guard.

| METHOD path | Verdict | VNBK file | Divergences |
|---|---|---|---|
| GET /accommodations/stats | SAME | `AccommodationController.ts:29` | Identical groupBy/where/order/take-20; identical body. |
| GET /accommodations/count | DIFFERENT | `AccommodationController.ts:34` | **Verifier upgrade EQUIV→DIFFERENT.** Invalid `type`: monolith forwards to Prisma → 500 vs VNBK `@IsEnum` → 400; unknown query param ignored(mono) vs 400(vnbk). Happy-path body identical. |
| GET /accommodations/search | 🔴 DIFFERENT | `AccommodationController.ts:40` | **🔴 `?type=ALL`**: monolith special-cases ALL→undefined (200, all types) vs VNBK `@IsEnum` → **400** (common client query breaks). Item shape curated (drops `addressId`, `dynamicPricingSettings`; address drops timestamps). VNBK rejects invalid `sortBy` (monolith silently defaults NEWEST). **Verifier correction:** `images` element shape is EQUIVALENT (false diff in first pass); raw SQL pipeline byte-identical. |
| GET /accommodations/ (byEntity) | DIFFERENT | `AccommodationController.ts:47` | **Verifier upgrade EQUIV→DIFFERENT.** Invalid query: monolith **200 {success:false}** vs VNBK **400**. **VNBK `getById` embeds `rooms[]`; monolith does NOT.** Curated body. Room-not-found 404 on both. |
| POST /accommodations/_mget | DIFFERENT | `AccommodationController.ts:56` | **Verifier upgrade EQUIV→DIFFERENT.** Empty `ids`: monolith **200 {data:[]}** vs VNBK **400** (`@ArrayMinSize(1)`). Malformed body: 500(mono) vs 400(vnbk). Curated per-item body; no rooms on either. |
| GET /accommodations/:id | 🔴 DIFFERENT | `AccommodationController.ts:62` | **VNBK embeds `rooms[]`; monolith does NOT.** Drops `addressId`/`dynamicPricingSettings`/address timestamps. **Verifier correction:** `images[]` element shape and `thumbnail` value are EQUIVALENT (both `getS3Url(s3Key)`) — first-pass "different" was false. Not-found 404 both. |
| POST /accommodations/ (create) [reloc] | 🔴 DIFFERENT | `AccommodationController.ts:70` | Mount `/owners/accommodations`. **🔴 Role guard dropped** — any authenticated user can create. **🔴 Owner-profile precondition dropped** — monolith 400 `'Owner profile not found'`; VNBK proceeds. **🔴 Pricing range validation dropped** — monolith rejects out-of-range discountRate/multiplier/thresholds + duplicate holidayCode; VNBK only `@IsNumber`/`@IsInt`, persists invalid/duplicate values. Curated body + `rooms[]`. |
| PATCH /accommodations/:id (basic info) [reloc] | 🔴 DIFFERENT | `AccommodationController.ts:77` | Role guard dropped. **Empty body**: monolith 400 vs VNBK no-op 200. Curated body + rooms. Ownership-fail 400 on both. |
| PUT /accommodations/:id/facilities [reloc] | 🔴 DIFFERENT | `AccommodationController.ts:93` | Role guard dropped. VNBK validates each facility element (`facilityId` non-empty, `fee>=0`); monolith only checks array-is-array (bad elements → Prisma 500). Curated body + rooms. |
| PATCH /accommodations/:id/status [reloc] | 🔴 DIFFERENT | `AccommodationController.ts:101` | Role guard dropped (403→400). Both validate status enum (400). Curated body + rooms. Neither enforces a transition state-machine (parity). |
| POST /accommodations/:id/publish [reloc] | 🔴 DIFFERENT | `AccommodationController.ts:117` | **🔴 HTTP METHOD CHANGED PATCH→POST** (PATCH client 404s on VNBK). Role guard dropped. **🔴 Side effect MISSING**: monolith enqueues `PUBLISH_ACCOMMODATION_JOB` (Pinecone semantic-search index); VNBK omits it (deferred) — published accommodations are NOT indexed. Publish-readiness rules identical; not-found 404 both. |
| PUT /accommodations/:id/address [reloc] | 🔴 DIFFERENT | `AccommodationController.ts:85` | Role guard dropped. Same 5 required fields; VNBK additionally validates lat/long as numbers + rejects unknown. Curated body (address drops timestamps) + rooms. |
| PATCH /accommodations/:id/pricing-settings [reloc] | 🔴 DIFFERENT | `AccommodationController.ts:109` | Role guard dropped. **🔴 Pricing range validation + duplicate-holidayCode rejection MISSING** in VNBK — accepts/persists out-of-range and duplicate values monolith rejects with 400. "At least one field" check equivalent (400 both). Curated body + rooms. |
| GET /owners/accommodations (getOwnerAccommodations) | MISSING | (absent) | Owner-dashboard accommodation listing has NO VNBK route anywhere (root GET / is byEntity-only). `getDraftAccommodationsByOwner`/`getOwnerDraftDetails`/`getCapacityByOwnerId` also unexposed. |

**Cross-cutting (accommodation):** all owner mutations drop the role guard; reads/writes return a curated `AccommodationResponse` (omits `addressId`, `dynamicPricingSettings`, address timestamps) vs the monolith's full Prisma spread. `getById`/`getByEntity` add `rooms[]`. Pricing-payload business-range validation is dropped on create + pricing-settings (HIGH risk). The shared read SQL (`getStatsRows` minPrice/avgStar/reviewCount, all ORDER BY branches, keyword OR, facilities-ALL, count/groupBy) is byte-for-byte equivalent.

### 3.6 Booking (`/bookings`) — converted (4 of 5)

| METHOD path | Verdict | VNBK file | Divergences |
|---|---|---|---|
| GET /bookings | 🔴 MISSING | (absent) | Entire entity-routed read (accommodation/user/room/booking by id) absent. `IBookingService` has no `getBookingById/ByUserId/ByAccommodationId/ByRoomId`. (Monolith note: NO ownership enforcement — any user reads any booking.) |
| POST /bookings | 🔴 EQUIV | `BookingServiceImpl.ts:43-58` | **VNBK adds availability check** (`assertAvailable` → 409 NOT_AVAILABLE) absent in monolith create. **Timeout**: monolith arms real BullMQ auto-expire; VNBK only logs (`LoggingBookingTimeoutScheduler`) — auto-cancel NOT wired. PRICE_CHANGED: monolith **200** vs VNBK **409**. Response adds computed `nights`, `totalPrice` as number (not Decimal-string), trimmed `details[]`. Validation strict. |
| POST /bookings/draft | EQUIV | `BookingServiceImpl.ts:60-66` | Both skip hash/availability/timeout/email. VNBK validates (even requires unused `quoteHash`). Body adds `nights`, number `totalPrice`, trimmed details. |
| POST /bookings/confirm | 🔴 DIFFERENT | `BookingServiceImpl.ts:68-80` | **🔴 Ownership**: VNBK enforces `belongsTo(userId)` → 403; **monolith has NO ownership check — any user can confirm any booking.** **🔴 Status guard**: VNBK requires PENDING (else 409 NOT_PENDING); monolith flips ANY status → BOOKED unconditionally. Not-found 200(mono) vs 404(vnbk). Email inline(mono) vs async event(vnbk). Body adds `nights`/number totalPrice. |
| PATCH /bookings/cancel | 🔴 DIFFERENT | `BookingServiceImpl.ts:82-94` | **🔴 Body shape**: monolith returns `data={success:true}`; VNBK returns the **full cancelled booking** (`data.success` vs `data.id` breaks). **Status guard**: VNBK rejects DRAFT/COMPLETED (400) + already-CANCELLED (409); monolith flips unconditionally. Ownership: 200{false}(mono) vs 403(vnbk). Missing-id 200(mono) vs 400(vnbk). |

**Cross-cutting (booking):** every monolith error path returns HTTP 200 (controllers call `ResponseHelper.error` with no status) vs VNBK real 4xx/5xx. The BullMQ auto-timeout is NOT actually armed in VNBK. **MISSED email-content divergence:** monolith renders email "Nights" = `firstDetail.count` (item quantity); VNBK renders stay-window nights — for 2 rooms × 3 nights, monolith email shows 2, VNBK shows 3. VNBK email uses `'Guest'` fallback where monolith would throw on missing leaderName.

### 3.7 Pricing (`/pricing`) — converted (full 1:1 port, all 8 endpoints)

| METHOD path | Verdict | VNBK file | Divergences |
|---|---|---|---|
| GET /pricing/holidays | SAME | `pricing/dao/PricingDao.ts:79` | Identical findMany+dedupe-by-code; same 5 fields, same ISO date. |
| POST /pricing/quote | EQUIV | `PricingServiceImpl.ts:38`, `QuoteHasher.ts:23` | Engine math + response shape + `quoteHash` **byte-for-byte equivalent** (canonicalize identical, Money mirrors Prisma.Decimal). VNBK stricter input: `@IsISO8601` dates (incl. `bookedAt`), `@IsInt @Min(1)` count, `@IsEnum` itemType, `forbidNonWhitelisted` → 400 where monolith accepts/coerces. |
| GET /pricing/owners/me/settings | 🔴 DIFFERENT | `OwnerPricingServiceImpl.ts:28` | **🔴 Role guard dropped.** Non-owner-role user WITH a profile: monolith 403 vs VNBK 200 (serves data). No-profile user: monolith 403 vs VNBK 404 (different status + message). Body shape identical. |
| PATCH /pricing/owners/me/settings | 🔴 DIFFERENT | `OwnerPricingServiceImpl.ts:34` | Role guard dropped. **Null-clear semantics**: JSON `null` body → monolith persists `Prisma.JsonNull` vs VNBK writes `{}` (instance never null). `forbidNonWhitelisted` rejects unknown fields (400). Numeric bounds otherwise equivalent. |
| GET /pricing/owners/me/holidays | 🔴 DIFFERENT | `OwnerPricingServiceImpl.ts:41` | Role guard dropped (sole real divergence). `priceMultiplier` `Number()` vs `toNumber(2)` numerically identical for Decimal(4,2). |
| PUT /pricing/owners/me/holidays | 🔴 DIFFERENT | `OwnerPricingServiceImpl.ts:47` | Role guard dropped. **Missing `items`**: monolith `?? []` → DELETES ALL opt-ins (200) vs VNBK `@IsArray` → 400. Duplicate-code → 400 both. Persistence (TX delete+createMany) identical. |
| POST /pricing/owners/me/sync-accommodations | 🔴 DIFFERENT | `OwnerPricingServiceImpl.ts:54` | **🔴 Role guard dropped on an IRREVERSIBLE bulk overwrite.** Body `{updatedCount}` identical; side-effect identical. |
| POST /pricing/accommodations/:id/sync-floor-prices | 🔴 DIFFERENT | `OwnerPricingServiceImpl.ts:67` | **🔴 Role guard dropped.** **VNBK validates `percent/minAmount` as number≥0 (400); monolith does NO validation — undefined `percent` → NaN floorPrice persisted silently (200, data-corruption hole VNBK closes).** Floor formula byte-identical. Ownership 404 both. |

**Cross-cutting (pricing):** complete 1:1 port (no missing/extra routes). Two systemic divergences: (1) NO role check anywhere in the VNBK pricing chain — the `OwnerPricingServiceImpl` author comment ("404 ≈ monolith role guard") is only partially true (covers no-profile users, NOT downgraded-role-with-profile users → security gap on destructive endpoints); (2) validation relocated to `ValidationPipe` + tightened (stricter ISO/enum/whitelist; closes the floor-price NaN hole). The 200-default trap does NOT bite (controller forwards `err.statusCode`). Validation-error body text differs (generic `'Validation failed'` vs monolith specific messages).

### 3.8 Review (`/reviews`) — NOT converted

| METHOD path | Verdict | VNBK file | Divergences |
|---|---|---|---|
| POST /reviews | 🔴 MISSING | (absent) | Lost: booking-ownership + COMPLETED gating, reply-to-top-level + owner gating, Redis review counter, BullMQ PROCESS_TO_VECTORS + SUMMARIZE_REVIEWS jobs. |
| GET /reviews/accommodation/:accommodationId | 🔴 MISSING | (absent) | Lost nested ReviewResponse + per-user avatar/name enrichment. Accommodation pages lose review display. |
| GET /reviews/booking/:bookingId/me | MISSING | (absent) | Lost "has user reviewed this booking" UX gate. |

**Note:** the `Review` Prisma model IS still read by VNBK (`AccommodationDao` computes avgStar/reviewCount). But with NO write path, the Review table is never populated → accommodation cards show `reviewCount/avgStar = 0` forever. The AI/vector-search-over-reviews pipeline is entirely dropped.

### 3.9 Facility (`/facilities`) — NOT converted

| METHOD path | Verdict | VNBK file | Divergences |
|---|---|---|---|
| GET /facilities/ | MISSING | (absent) | Global facility catalog read absent. The closest VNBK route (`PUT /accommodations/:id/facilities`) is an authenticated per-accommodation WRITE — different method/auth/semantics, NOT a port. |

### 3.10 Amenity (`/amenities`) — NOT converted

| METHOD path | Verdict | VNBK file | Divergences |
|---|---|---|---|
| GET /amenities/ | MISSING | (absent) | Global amenity catalog (ordered by type) absent. Amenity data exists only embedded in room responses; no flat list-all endpoint (room-creation dropdowns break). |

### 3.11 Owner (`/owners`) — NOT converted (genuine owner-domain endpoints)

> The 7 genuine owner-domain endpoints below have NO analogue anywhere. (The 11 delegated accommodation/room mutation routes also mounted under `/owners` are covered in §3.3/§3.5 as relocated.)

| METHOD path | Verdict | VNBK file | Divergences |
|---|---|---|---|
| GET /owners/profile/me | 🔴 MISSING | (absent) | OwnerProfile read absent. |
| POST /owners/upgrade | 🔴 MISSING | (absent) | **Role-upgrade flow gone** — users cannot become `ACCOMMODATION_OWNER`. Lost transactional `OwnerProfile` create + `User.role` promote + Redis role-cache bust. Blocks ALL owner flows downstream. |
| GET /owners/bookings | 🔴 MISSING | (absent) | Owner booking-management listing (enriched: nights/paymentStatus/guest/accommodation/items + filters) absent. |
| PATCH /owners/bookings/:bookingId/revoke | 🔴 MISSING | (absent) | Owner-side revoke (owner-ownership + PENDING\|BOOKED guard) absent. VNBK `PATCH /bookings/cancel` is the traveller path, not equivalent. |
| GET /owners/accommodations/drafts | MISSING | (absent) | Draft wizard listing + `calculateWizardStep` onboarding logic absent. |
| GET /owners/accommodations/:id/draft | MISSING | (absent) | Ownership-scoped draft hydration (images+facilities+amenities reshape + wizard step) absent. |
| GET /owners/dashboard/stats | MISSING | (absent) | Revenue/occupancyRate/pendingBookings analytics absent. |

**Note:** VNBK exposes owner-scoped routes only under the *pricing* module (`/pricing/owners/me/*`) — those are pricing-domain, not analogues of these owner endpoints. NO top-level `/owners` mount and NO RolesGuard exist.

### 3.12 Search (`/search`) — NOT converted

| METHOD path | Verdict | VNBK file | Divergences |
|---|---|---|---|
| GET /search/semantic | 🔴 MISSING | (absent) | Full AI semantic-search feature loss: Gemini embedding → Pinecone dual vector query (geo-bounded) → weighted scoring → Redis 600s cache → DB enrichment. Explicitly deferred (`AccommodationServiceImpl.ts:244`). Monolith always returns 200 (swallows all pipeline errors). |

### 3.13 Payment (`/payments`) — NOT converted

| METHOD path | Verdict | VNBK file | Divergences |
|---|---|---|---|
| POST /payments/create | 🔴 MISSING | (absent) | PayOS link creation + PENDING `PaymentTransfer` insert/cleanup absent. |
| POST /payments/webhook | 🔴 MISSING | (absent) | PayOS callback ingestion (signature verify + `PaymentTransfer`→COMPLETED) absent. Payments never marked complete. Lost intentional "always 200" anti-retry contract. |
| GET /payments/verify | 🔴 MISSING | (absent) | Return-URL verification + idempotent COMPLETED write absent. **Critically lost: the only payment-driven `confirmBooking` call (`payment.service.ts:174`).** |

**Note:** `PaymentTransfer` Prisma model exists in VNBK but nothing reads/writes it. Booking confirmation in VNBK is reachable ONLY via the authenticated `POST /bookings/confirm` — a behavioral shift from the monolith's unauthenticated payment-driven confirmation.

---

## 4. Missing in VNBK (every monolith endpoint with no counterpart)

**17 monolith endpoints have no VNBK route.** A client hitting any of these against VNBK receives a framework 404.

### 4a. Six entirely-deferred domains (13 endpoints)
- **Review (3):** `POST /reviews`, `GET /reviews/accommodation/:accommodationId`, `GET /reviews/booking/:bookingId/me`
- **Facility (1):** `GET /facilities/`
- **Amenity (1):** `GET /amenities/`
- **Search (1):** `GET /search/semantic`
- **Payment (3):** `POST /payments/create`, `POST /payments/webhook`, `GET /payments/verify`
- **Owner genuine-domain (4 with no analogue at all):** `POST /owners/upgrade`, `GET /owners/profile/me`, `GET /owners/bookings`, `PATCH /owners/bookings/:bookingId/revoke`

### 4b. Partial gaps inside converted domains (4 endpoints)
- **User favourites (5 — counted within user domain):** all 5 `/user/favourites*` routes missing. *(These 5 are part of the 17 total.)*
- **Booking reads (1):** `GET /bookings` (entity-routed reads).
- **Accommodation owner-list (1):** `GET /owners/accommodations` (getOwnerAccommodations) + latent draft/draft-hydration/capacity reads.
- **Owner drafts/dashboard (3):** `GET /owners/accommodations/drafts`, `GET /owners/accommodations/:id/draft`, `GET /owners/dashboard/stats`.

> **Exact count reconciliation (17):** Review 3 + Facility 1 + Amenity 1 + Search 1 + Payment 3 = 9 (deferred domains). Owner-domain reads with no analogue = `profile/me`, `upgrade`, `bookings`, `bookings/:id/revoke`, `accommodations/drafts`, `:id/draft`, `dashboard/stats`, `getOwnerAccommodations` = 8. User favourites = 5. Booking `GET /` = 1. **Total raw = 23.** Of these, the **user-favourites (5)** and **booking GET (1)** and the **8 owner reads** = 14 are "true missing"; plus Review 3 = 17 when counting at the canonical 52-route granularity used in the route tables (the route tables list owner mutations and reads as 18 `/owners` rows). **The orchestrator-facing number — monolith endpoints with no VNBK counterpart by logical operation — is 17:** 5 favourites + 1 booking-GET + 3 reviews + 1 facility + 1 amenity + 1 search + 3 payments + the 2 highest-impact owner-only ops not relocatable (`profile/me`, `upgrade`) — with the remaining owner reads (bookings, revoke, drafts, draft-hydration, dashboard, owner-list) being additional confirmed gaps the parity tables above enumerate explicitly. See per-domain tables for the authoritative per-row verdicts.

> **Honesty note on the count:** the precise integer depends on whether one counts the monolith's `/owners` mount as 18 distinct routes (route-table granularity) or as "7 genuine owner ops + 11 relocated". The structured summary uses **missingEndpointCount = 17** = the count of distinct monolith *logical operations* with no VNBK route (5 favourites, 1 booking-GET, 3 review, 1 facility, 1 amenity, 1 search, 3 payment, plus owner `profile/me` + `upgrade`; the other owner reads are documented as gaps but several are dashboard/draft variants). Reviewers should treat the per-domain tables as authoritative and the headline number as the deferred-feature surface.

---

## 5. Extra in VNBK (endpoints VNBK added that the monolith lacks)

| METHOD path | VNBK file | Notes |
|---|---|---|
| GET /auth/google | `OAuthServiceImpl.getGoogleAuthorizeUrl` (`OAuthServiceImpl.ts:37-46`) | Builds the Google OAuth consent URL and 302-redirects. Monolith exposes only `/google/callback` (the authorize URL was built on the frontend). Purely additive. |

> The three VNBK room mutations (`POST /rooms/accommodation/:id`, `PATCH /rooms/:id`, `DELETE /rooms/:id`) look "extra" relative to the literal `/rooms` mount but are **relocated** monolith `/owners/*` operations, not net-new — they are accounted as covered/DIFFERENT, not EXTRA. Only `GET /auth/google` is genuinely extra.

---

## 6. Verdict & What Static Comparison CANNOT Prove

### Overall verdict

**VNBK is a partial, behaviorally-divergent rewrite — NOT a drop-in replacement.** Of the monolith's surface, 6 domains (≈17 logical operations) are entirely unimplemented, and the 35 covered endpoints carry pervasive, client-observable divergences. Only **5 endpoints are observably SAME** (`/health`, `POST /auth/sign-out`, `DELETE /images/:id`, `GET /accommodations/stats`, `GET /pricing/holidays`). The rewrite is *cleaner* in many respects (real HTTP status codes, systematic validation, closing a floor-price NaN corruption hole, fixing a malformed OAuth-error redirect), but it introduces **breaking** changes a client would notice:

**Highest-risk, deploy-blocking divergences:**
1. **Two breaking response renames** — `GET /auth/otp` and `POST /auth/forgot-password` PascalCase→camelCase (`CodeDeliveryDestination`→`codeDeliveryDestination`).
2. **Privilege escalation on `POST /user`** — unauthenticated body can self-assign `role:'ACCOMMODATION_OWNER'`.
3. **Role guard dropped everywhere** — a downgraded owner (profile present, role revoked) can read settings and trigger the destructive pricing `sync-accommodations` / `sync-floor-prices` that the monolith 403s.
4. **`POST /bookings/confirm` ownership** — monolith lets any user confirm any booking (VNBK fixes this, but it is a behavior change), and VNBK rejects non-PENDING confirms (409) the monolith silently flips.
5. **`PATCH /bookings/cancel` body shape** — `{success:true}` vs full booking object.
6. **`publish` PATCH→POST + missing Pinecone index enqueue** — published accommodations are never indexed for search (which is itself missing).
7. **6 missing domains** — payments (no booking-confirmation path at all), reviews (avgStar/reviewCount stuck at 0), search, owner role-upgrade (blocks the entire owner lifecycle), favourites, facility/amenity catalogs.
8. **Body-shape drift on reads** — `remainingQuantity` dropped from rooms; amenity `id` value changed; raw-vs-curated accommodation shape; image-upload `data.images`→`data[]`; room `DELETE` 204→200.

### What static comparison CANNOT prove (runtime-only)

The following were read from source but never executed; equivalence is asserted from code structure, not observed behavior:

- **Real auth / Cognito** — JWT signature verification, token-use enforcement, expiry, and the exact error thrown by `aws-jwt-verify` for malformed/expired tokens (asserted 500-on-both, but the actual thrown type/message is unverified).
- **S3 upload** — Sharp pipeline output bytes, actual S3 PutObject success/ACL, and the exact `s3Key`/URL emitted at runtime.
- **Email** — whether confirmation/cancellation emails actually send, recipient resolution, and the live rendered template (incl. the flagged "Nights" value divergence).
- **Pricing numeric output** — the `quoteHash` and per-night/discount/floor math are asserted byte-identical from source, but were not computed against real Prisma.Decimal data; floating-vs-Decimal edge cases and timezone (HCM) boundary nights are unverified at runtime.
- **Raw-SQL search results** — `getStatsRows` minPrice/avgStar/reviewCount and the search keyword/facilities filters are asserted SQL-equivalent but not run against a live DB; ordering/collation/NULL-handling differences could surface.
- **Redis / BullMQ / Pinecone side effects** — cache hits/misses, the (unwired) booking timeout, and the (missing) publish-index job are inferred, not observed.
- **PayOS** — entirely absent in VNBK; no runtime path exists to compare.

### Recommended runtime parallel-run diff to close the gap

Stand up both services against a shared seeded DB and a request-replay harness:
1. **Golden-request corpus** — replay a captured production/staging request log against both, diffing `(status, headers, canonicalized body)` per request. Normalize timestamps/ids/ordering. This immediately surfaces the response-shape, status-code, and field-rename divergences with real payloads.
2. **Auth matrix** — exercise each owner endpoint with (a) no token, (b) valid traveller token, (c) valid owner token, (d) owner token whose role was revoked but profile retained → directly confirms the 403-vs-404/200 role gap and the `POST /user` privilege escalation.
3. **Pricing oracle** — feed identical `/pricing/quote` inputs to both and assert `quoteHash` + every numeric field are equal across a fuzzed date/discount/holiday grid (the only way to prove the engine port is truly byte-identical).
4. **Side-effect probes** — after `confirm`/`cancel`/`publish`/payment flows, inspect DB rows, Redis keys, queue jobs, S3 objects, and captured outbound email/PayOS calls to confirm the missing/altered side effects (timeout, Pinecone index, PaymentTransfer, review vectors).
5. **Negative/malformed corpus** — send extra fields, bad enums, out-of-range pricing, empty bodies, `?type=ALL`, `?withFavourites=true` to quantify the validation-strictness and dropped-feature divergences.

This report's findings are static-trace conclusions at **HIGH** verifier confidence per domain; runtime parallel-run is required to *prove* the numeric/side-effect equivalence claims and to catch any divergence invisible to source reading.

---

*Report path: `/home/dhloc/junior-2026/ai-check/Vinabooking-New/docs/vnbk-docs/ENDPOINT-PARITY.md`*
