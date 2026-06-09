# Huy — Accommodation, Owner & Content

**Git identity:** zhwy512 / Huy Nguyen `<huyngh05@gmail.com>` (382 commits)
**Original timeline:** Accommodation/Room/Facility/Amenity repos (Jan 26) → Email (Feb 5) → Review (Feb 9) → Favourite (Feb 22) → Owner profile/dashboard/draft (Mar 2 – Apr 22)

You were the dominant author of **Accommodation** (12 repo + 9 service + 7 controller commits) and
built the **Owner** domain, **Facility/Amenity** catalogs, the **Review** service/REST layer, the
**Favourite** service, and the **Email** service. Accommodation is fully converted; the rest are
deferred (with a clear target), and Email became shared infrastructure.

> Legend: ✅ = converted, ⏳ = deferred (follow `API/vnbk-service/RECIPE.md`).

---

## Feature 1 — Accommodation (CRUD + detail + search/stats + status) ✅
*Monolith: 01-26 AccommodationRepository + SearchFilters; 02-05 service/controller/router (Sang created, you dominated); 03-13/14 owner accommodation create/update; 03-16 publish; 04-22 draft hydration.*

This was the biggest single module (531-line service with raw SQL, Redis cache, holiday opt-ins).
It's fully converted, with the raw SQL kept encapsulated in the DAO and caching behind a port.

| Monolith | vnbk-service | Note |
|---|---|---|
| `repositories/accommodation.repository.ts` (incl. `$queryRaw` stats: minPrice/avgStar/reviewCount; transactions) | `modules/accommodation/repository/IAccommodationRepository.ts` + `dao/AccommodationDao.ts` + `dao/mapper/AccommodationEntityMapper.ts` | raw SQL stays inside `AccommodationDao.getStatsRows` with `@@map` table-name constants (`accommodations`/`rooms`/`beds`/`Review`). |
| `services/accommodation.service.ts` (CRUD, get-by-id aggregation + `acc:detail:` Redis cache, search, status, count, `getAccommodationByRoomId`) | `modules/accommodation/service/{IAccommodationService,impl/AccommodationServiceImpl}.ts` + `service/impl/AccommodationCacheCodec.ts` | cache via `ICacheService`; codec (de)serializes the base aggregate. |
| `controllers/accommodation.controller.ts` + `FacilityController`, `routes/accommodation.routes.ts` (+ `_mget`, publish) | `modules/accommodation/rest/{AccommodationController,AccommodationRouter,mapper/AccommodationDtoMapper}.ts` | |
| `types/accommodation.types.ts` (CreateAccommodationDTO, AccommodationFullInfo, SearchFilters, ESortOption) | `modules/accommodation/dto/request/*` (class-validator) + `dto/response/*` + `enums/ESortOption.ts` |
| Accommodation/Address/FacilityConfig Prisma types | `modules/accommodation/domain/{Accommodation,Address,Facility,FacilityConfig,DynamicPricingSettings}.ts` + `enums/{EAccommodationType,ERentalType,EAccommodationStatus,EFacilityType}.ts` |

**Investigate/learn:**
- `AccommodationDao.getStatsRows` — your `$queryRaw` search/stats, now encapsulated + the table-name
  bugs fixed via `@@map` constants.
- `AccommodationServiceImpl` + `AccommodationCacheCodec` — the `acc:detail:` read-through cache via
  `ICacheService` (it caches only the base aggregate; rooms/images/stats merge fresh).
- `getAccommodationByRoomId` — the entry point the **booking** module calls (kept acyclic: booking →
  accommodation, never the reverse).
- Detail aggregation pulls rooms via `IRoomService.getRoomsByAccommodationId` and images via
  `IImageService.getImagesByEntities` — both through their public barrels only.

**Deferred sub-features (commented in code):** owner-dashboard cards/`getOwnerAccommodations`,
`getDraftDetails` (draft hydration), `getCapacityByOwnerId`, and the publish-time Pinecone re-index
(belongs with search). Port these with the owner work below.

---

## Feature 2 — Owner (profile, role upgrade, dashboard, draft) ⏳ DEFERRED
*Monolith: 03-02 OwnerProfile schema; 03-05 owner repo/service/controller/routes; 03-06 role cache + RBAC; 03-27 dashboard stats; 04-22 draft hydration.*

Not yet in vnbk-service. Suggested target when porting (follow `RECIPE.md`):

| Monolith (to port) | Suggested vnbk-service target |
|---|---|
| `repositories/owner.repository.ts` (OwnerProfile, prisma transaction) | `modules/owner/repository/IOwnerRepository.ts` + `dao/OwnerDao.ts` |
| `services/owner.service.ts` (profile creation, role upgrade) | `modules/owner/service/{IOwnerService,impl/OwnerServiceImpl}.ts` |
| `controllers/owner.controller.ts`, `routes/owner.routes.ts` | `modules/owner/rest/*` |
| dashboard stats (cross-domain: booking + room) | a read/query service using `IBookingService` + `IRoomService` (or a CQRS-lite read DTO) |
| `middlewares/role.middleware.ts` RBAC | **build a `RolesGuard`** in `src/http/middleware/` — currently MISSING. It should inject `IUserService.getRole` (the role cache already moved there). This is the one piece owner routes need that the slice skipped. |

**Investigate/learn before porting:** `modules/user` (`IUserService.getRole` already implements your
Redis role cache from `role.middleware`), and `modules/auth` (role upgrade touches Cognito/user).
**Build `RolesGuard` first** — it unblocks every owner/admin route and the pricing owner routes too.

---

## Feature 3 — Facility & Amenity catalogs ⏳ DEFERRED
*Monolith: 01-26 FacilityRepository + AmenityRepository; 03-26 AmenityController/repo/router.*

- **FacilityConfig** (the accommodation↔facility join) is already handled inside
  `modules/accommodation` (read `domain/FacilityConfig.ts`, `domain/Facility.ts` — Facility is
  currently read-only there).
- The **standalone catalog CRUD** (managing the master `Facility`/`Amenity` lists) is deferred.

| Monolith (to port) | Suggested vnbk-service target |
|---|---|
| `repositories/facility.repository.ts`, `controllers/facility.controller.ts`, `routes/facility.routes.ts` | `modules/facility/*` (small CRUD module) |
| `repositories/amenity.repository.ts`, `controllers/amenity.controller.ts`, `routes/amenity.routes.ts` | `modules/amenity/*` (Amenity domain already mirrored in `modules/room/domain/Amenity.ts` for room configs) |

**Investigate/learn:** `modules/room/domain/{Amenity,AmenityConfig}.ts` and
`modules/accommodation/domain/{Facility,FacilityConfig}.ts` — the config/join sides already exist; you
only need the catalog CRUD. These are the simplest modules — good warm-up; copy `modules/user` shape.

---

## Feature 4 — Review service & REST ⏳ DEFERRED
*Monolith: 02-09 ReviewService/Controller/Router + integration; 05-17/20 replies + ownership validation.*

The review **data layer** was Sang's, the **AI-summary** Lộc's; you built the **service + REST +
replies**. The whole `review` domain is deferred — coordinate with both.

| Monolith (to port) | Suggested vnbk-service target |
|---|---|
| `services/review.service.ts` (create, replies, ownership) | `modules/review/service/{IReviewService,impl/ReviewServiceImpl}.ts` |
| `controllers/review.controller.ts`, `routes/review.routes.ts` | `modules/review/rest/*` |
| trigger AI summary on create | publish a `ReviewCreatedEvent` (see `shared/events/`) handled by the summary worker (Lộc's deferred workers) |

**Investigate/learn before porting:** `shared/events/` (use an event to trigger summarization instead
of a direct worker call) and `modules/booking`/`modules/accommodation` barrels (reviews reference both).

---

## Feature 5 — Favourite ⏳ DEFERRED
*Monolith: 02-22 FavouriteService (you); 01-23 FavouriteRepository (Lộc).*

Deferred. Note: the **default favourite list** created on user sign-up is already reproduced in
`modules/user/dao/mapper/UserEntityMapper.toCreateInput` (`favourites: { create: { name: "My
Favourite List" } }`). The favourite **list/item management** maps to a future `modules/favourite/*`
(or could live under `modules/user` as a sub-feature). It belongs to the user aggregate's neighborhood.

**Investigate/learn:** `modules/user/dao/mapper/UserEntityMapper.ts` (see the default list already there).

---

## Feature 6 — Email ✅ (became shared infrastructure)
*Monolith: 02-05 SMTP client + EmailService (you).*

Your `EmailService` split into **transport** (now shared infra) + **templating** (moves to each
consumer):

| Monolith | vnbk-service | Note |
|---|---|---|
| `clients/smtp.client.ts` (`SmtpClient`, `IMailClient`) | `infrastructure/mail/SmtpMailSender.ts` (+ `IMailSender.ts`) | `@singleton`, lazy transporter; `send({to,subject,text,html})`. |
| `services/email.service.ts` (templated `sendConfirmationEmail`, `sendCancellationEmail`, welcome) | template-building moves to the consumer that owns the message | e.g. booking emails now live in `modules/booking/events/handlers/Send{Confirmation,Cancellation}EmailHandler.ts`, which build the HTML and call `IMailSender`. |
| `utils/image.ts` (pick images for emails) | reattach in the handler via `IImageService`/accommodation data when porting the richer templates | |

**Investigate/learn:** `modules/booking/events/handlers/SendBookingConfirmationEmailHandler.ts` — this
is the model for "email = a domain-event handler that composes a template + calls `IMailSender`".
Your auth welcome email already works this way in `modules/auth` (via `IMailSender`).

---

## Your fastest path in
1. `modules/accommodation/` end-to-end — your biggest converted module (raw SQL + cache + aggregation).
2. `modules/accommodation/service/impl/AccommodationCacheCodec.ts` + `dao/AccommodationDao.getStatsRows`.
3. **Build `RolesGuard`** (`src/http/middleware/`) — the missing piece your owner/facility routes need;
   `IUserService.getRole` already has your Redis role cache.
4. For owner/facility/amenity/review/favourite: `RECIPE.md` + copy the `modules/user` (simplest) or
   `modules/accommodation` (richest) shape; use `shared/events/` for review→summary.
