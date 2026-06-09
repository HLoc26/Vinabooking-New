# Migration Plan: `monolith-service` → pure-OOP modular monolith `vnbk-service`

## Context

`API/monolith-service/` is an Express 5 + Prisma 7 (MariaDB) + TypeScript app with 13 domains
(auth, user, accommodation, room, booking, review, payment, image, owner, pricing, facility,
amenity, search, favourite). It is *already* class-based (controllers/services/repositories/routers)
but with significant OOP smells:

- **No domain models** — Prisma-generated types leak through every layer; business rules live in
  services, not entities (e.g. booking status guards are inline `if` checks in `booking.service.ts`).
- **No real interfaces** — services/repositories are concrete classes; callers depend on
  implementations, not abstractions.
- **Manual DI + setter hacks** — `src/index.ts` hand-wires everything; circular deps
  (booking ↔ accommodation ↔ pricing) are patched with `setAccommodationService()` /
  `setPricingService()` setters and runtime null-guards (`booking.service.ts:44-50, 53, 215, 297`).
- **No runtime validation**, response/error handling is ad-hoc per controller, `$queryRaw` and
  conditional-include generics (`findById<T extends boolean>`) blur layer boundaries, and Redis
  caching is scattered inside services + middleware.

The goal: rebuild into `API/vnbk-service/` as a **pure-OOP, "Java-in-TypeScript", n-layer modular
monolith** — strict SOLID, design patterns, three distinct model concepts (Prisma entity / domain
model / DTO), one class-or-interface per file. The new service reuses the **same Prisma schema and
the same database** so it can be parallel-run and behavior-diffed against the monolith.

## Locked decisions

| # | Decision | Choice |
|---|----------|--------|
| Scope | What to convert now | **Core dependency-slice end-to-end** (user, auth, pricing, room, accommodation, booking — plus a minimal `image` needed by accommodation/room) + a documented repeatable recipe for the remaining leaf domains. |
| DI | Wiring | **tsyringe** container (`@injectable`/`@inject`, per-module registration). Requires `experimentalDecorators` + `emitDecoratorMetadata` + `reflect-metadata`. |
| dao vs repository | Layer split | **`repository/` = interface (port)** returning domain models; **`dao/` = the implementation** (the current Prisma-query code, mapped to/from domain). Only `dao/` imports Prisma. |
| Naming | Interfaces vs impls | **I-prefix interfaces** + suffixed impls: `IBookingService`+`BookingServiceImpl`, `IBookingRepository`+`BookingDao`. |

**Folded-in (not re-asked):** keep **Express 5** (the requested folder shape conflicts with NestJS
conventions); add **class-validator + class-transformer** for request-DTO validation (decorators are
enabled for tsyringe anyway, and runtime validation is currently absent); **copy `schema.prisma`
byte-for-byte**, keep generator `output = "../src/generated"`, run `prisma generate` only (never
`migrate`/`db push` — the monolith owns schema lifecycle); keep **CommonJS + `@/*` alias + tsc/tsc-alias**
build; reuse `.prettierrc` (tabs, width 200, double quotes).

---

## Target architecture

### Top-level layout

```
API/vnbk-service/
  prisma/                 # copied schema.prisma (+ prisma.config.ts), generator → src/generated
  src/
    generated/            # prisma generate output (gitignored)
    main.ts               # entrypoint: import "reflect-metadata" FIRST, then bootstrap
    Application.ts        # composition root: build container, register modules, start Express
    config/
      AppConfig.ts        # typed env access (replaces scattered process.env reads)
    di/
      container.ts        # tsyringe container factory
      IModule.ts          # interface every <X>Module implements: register(container)
    shared/               # domain-agnostic kernel
      domain/   AggregateRoot.ts  Entity.ts  ValueObject.ts  valueobjects/{Money,DateRange,...}.ts
      mapper/   IMapper.ts                 # toDomain / toPersistence base contract
      error/    AppError.ts  BadRequestError.ts  NotFoundError.ts  ConflictError.ts ...  (one/file)
      http/     ApiResponse.ts  ResponseEnvelope.ts        # the {success,data,error} envelope
      events/   DomainEvent.ts  IDomainEventPublisher.ts  IDomainEventHandler.ts  InProcessEventPublisher.ts
      pagination/  Page.ts  PageRequest.ts
    infrastructure/        # external systems behind ports (Singletons), one folder per integration
      persistence/  PrismaProvider.ts                      # single PrismaClient + mariadb adapter
      cache/        ICacheService.ts  RedisCacheService.ts # all redis access routes through here
      auth-idp/     ICognitoProvider.ts  CognitoProvider.ts
      storage/      IObjectStorage.ts  S3Storage.ts
      mail/         IMailSender.ts  SmtpMailSender.ts
      queue/        QueueRegistry.ts  (producers/workers added when leaves land)
      # gemini / pinecone / payos ports added with review/search/payment (out of core slice)
    http/                  # framework HTTP layer
      BaseController.ts    # Template Method: runs handler, wraps ResponseEnvelope, forwards errors
      BaseRouter.ts        # abstract: holds Router, abstract registerRoutes() + basePath
      AppRouter.ts         # mounts every module router under its prefix; /health
      middleware/  AuthGuard.ts  RolesGuard.ts  ValidationPipe.ts  ErrorHandlerMiddleware.ts  RequestLogger.ts
    modules/
      user/  auth/  pricing/  room/  image/  accommodation/  booking/   # core slice
      # review/ payment/ owner/ search/ favourite/ amenity/ facility/   # later, via recipe
```

### Per-module structure (example: `booking/`)

```
modules/booking/
  domain/
    Booking.ts                 # rich aggregate: cancel(), confirm(), isCancellable(), belongsTo()
    BookingDetail.ts
  enums/
    EBookingStatus.ts          # mirrors/re-exports Prisma enum
    ECancellationSource.ts
  dto/
    request/   CreateBookingRequest.ts  ConfirmBookingRequest.ts  CancelBookingRequest.ts ...
    response/  BookingResponse.ts  OwnerBookingResponse.ts ...
  repository/
    IBookingRepository.ts      # INTERFACE (port) — methods take/return domain Booking
  dao/
    BookingDao.ts              # implements IBookingRepository; the current Prisma-query code
    mapper/  BookingEntityMapper.ts   # Prisma entity <-> domain Booking
  service/
    IBookingService.ts         # INTERFACE (use-case contract)
    IBookingFactory.ts         # creates valid Booking aggregates
    port/  IAccommodationLookup.ts  IPricingQuote.ts   # narrow ports booking needs from others
  service/impl/
    BookingServiceImpl.ts      # thin orchestration
    BookingFactoryImpl.ts
  rest/
    BookingController.ts
    BookingRouter.ts
    mapper/  BookingDtoMapper.ts      # domain <-> DTO
  events/
    BookingCancelledEvent.ts  BookingConfirmedEvent.ts
  booking.tokens.ts            # injection tokens (symbols) for the interfaces above
  BookingModule.ts             # implements IModule: registers all bindings + event handlers
  index.ts                     # PUBLIC barrel — exports ONLY: IBookingService, tokens, DTOs, ports, events
```

**Module sealing rule:** a module may import another module **only via its `index.ts`** (service
interface, DTOs, tokens, ports, events). Importing another module's `dao/`/`domain/`/`service/impl/`
is forbidden — enforce with ESLint `no-restricted-imports` on `modules/*/{dao,domain,service/impl}/**`.

### Naming conventions

| Concept | Interface (file) | Implementation (file) |
|---|---|---|
| Service | `IBookingService` (`service/`) | `BookingServiceImpl` (`service/impl/`) |
| Repository / DAO | `IBookingRepository` (`repository/`) | `BookingDao` (`dao/`) |
| Factory | `IBookingFactory` (`service/`) | `BookingFactoryImpl` (`service/impl/`) |
| Entity mapper | `IMapper<Booking, PrismaBooking>` (`shared/mapper/IMapper.ts`) | `BookingEntityMapper` (`dao/mapper/`) |
| DTO mapper | — | `BookingDtoMapper` (`rest/mapper/`) |
| Controller / Router | — | `BookingController` / `BookingRouter` (`rest/`) |
| Domain / Enum | — | `Booking` (`domain/`) / `EBookingStatus` (`enums/`) |
| DTOs | — | `CreateBookingRequest` (`dto/request/`), `BookingResponse` (`dto/response/`) |

### The three model concepts + data flow

- **(a) Prisma entity** — generated type from `@/generated/client`. Pure persistence data
  (`Prisma.Decimal`, snake-case maps). **Confined to `dao/` and `dao/mapper/`.**
- **(b) Domain model** (`domain/`) — hand-written class with invariants + behavior. e.g. `Booking`
  owns `isCancellable()` (PENDING/BOOKED only), `cancel(source, note)`, `confirm()`, `belongsTo(userId)` —
  pulling the rules currently inline in `booking.service.ts:146-148, 215, 300`.
- **(c) DTOs** (`dto/request|response/`) — request DTOs are **classes** with class-validator
  decorators; response DTOs decouple the wire shape (Decimal→string, hide internals).

```
HTTP body → plainToInstance → CreateBookingRequest (validated by ValidationPipe)
          → IBookingFactory builds Booking (invariants enforced)
          → IBookingService orchestrates
          → IBookingRepository.save(booking)                     [domain in]
              → BookingDao: BookingEntityMapper.toPersistence(booking) → Prisma input → prisma.create
              → BookingEntityMapper.toDomain(saved) → Booking     [domain out]
          → BookingDtoMapper.toResponse(booking) → BookingResponse
          → BaseController wraps ResponseEnvelope.success → HTTP
```

### Dependency Injection (tsyringe)

- Interfaces vanish at runtime → each interface gets an **injection token** (symbol) declared in
  `<module>.tokens.ts`, e.g. `export const BOOKING_SERVICE = Symbol("IBookingService")`.
- Constructor injection only: `constructor(@inject(BOOKING_REPOSITORY) private readonly repo: IBookingRepository) {}`.
- Each module ships `<X>Module.ts implements IModule` that registers its bindings + subscribes its
  event handlers. `Application.ts` calls `module.register(container)` for every module, registers
  infrastructure singletons once, then resolves `AppRouter`. **`registry.ts` and all setters deleted.**

### Validation

`ValidationPipe.body(CreateBookingRequest)` returns Express middleware that runs
`plainToInstance` + `validate` (`whitelist:true, forbidNonWhitelisted:true`), throws
`BadRequestError` (→ 400) on failure, and attaches the typed DTO. Shape/format only — cross-field &
business rules (checkout-after-checkin, quote-hash match, availability) stay in domain/service.

### Breaking the circular dependency (the trickiest part)

The real cycle: **booking → accommodation** (`getAccommodationByRoomId`) and
**accommodation → booking** (`getBookedCounts` for availability), plus `room → pricing`, `booking → pricing`.

1. **Narrow ports (Interface Segregation).** Booking depends on `IAccommodationLookup`
   (just `getAccommodationByRoomId`) and `IPricingQuote` (just `quote`) — declared in
   `booking/service/port/`, implemented by the accommodation/pricing modules. Accommodation depends
   on a narrow `IBookedCountQuery` it declares for itself.
2. **tsyringe lazy resolution** (`@inject(delay(() => ...))`) is the sanctioned mechanism if a true
   constructor cycle remains after segregation — type-safe and container-managed, replacing setters.
3. **Domain events** for write-side cross-module side effects: `BookingServiceImpl.cancel()` mutates
   the `Booking` domain, saves, then `publish(new BookingCancelledEvent(...))`. The **email** concern
   (currently `booking.service.ts:308-352`) and **payment-transfer-fail** become event handlers in
   their own modules. Publisher is **in-process & synchronous** (handlers run within the request) so
   behavior stays equivalent to today. This removes booking's direct reach into Email/User/Accommodation.

### Design-pattern map

Repository (port) → `repository/`; DAO (adapter) → `dao/`; DTO → `dto/`; Mapper → `dao/mapper` +
`rest/mapper` (base `IMapper`); **Factory** → `IBookingFactory` (replaces inline `Prisma.BookingCreateInput`
building); **Strategy** → pricing rules (`HolidayMultiplierRule`, `LongStayDiscountRule`,
`EarlyBirdDiscountRule`, `FloorPriceRule` + `PerNight`/`Static` strategies — decomposes the ~200-line
`pricing.service.ts` `quote()`); DI → tsyringe; Singleton → infrastructure providers; Template Method →
`BaseController`/`BaseRouter`/`IMapper`/`AggregateRoot`; Domain Events → cross-module side effects.

---

## End-to-end example — `PATCH /bookings/cancel` (the clearest payoff)

Today `cancelBooking` (`booking.service.ts:296-355`) is ~60 lines: ownership check + status guard +
DB update + accommodation lookup + user lookup + dual email send. Target:

1. `BookingRouter` → `AuthGuard.handle` → `ValidationPipe.query(CancelBookingRequest)` → `BookingController.cancel`.
2. `BookingController.cancel` reads `req.userId` + id + note, calls `bookingService.cancel(id, {note, source: TRAVELLER, requestedByUserId})`.
3. `BookingServiceImpl.cancel`: `const booking = await repo.findById(id)` (throws `NotFoundError`).
4. **Domain** `Booking`: `if (!booking.belongsTo(userId)) throw ForbiddenError`; `booking.cancel(TRAVELLER, note)` — which itself enforces `isCancellable()`. **All rules live in the domain.**
5. `repo.save(booking)` → `BookingDao` maps + `prisma.booking.update`.
6. `eventPublisher.publish(new BookingCancelledEvent(...))` — **no direct Email/Accommodation/User calls.**
7. `SendCancellationEmailHandler` (email module) + payment-fail handler (payment module, later) react.
8. Controller maps to `BookingResponse`, `BaseController` wraps the envelope.

Service method shrinks to ~6 lines; rules move to the domain; side effects decouple via events.

---

## Phase 0 — Bootstrap (must run a `/health` route before any domain work)

1. **package.json** — carry over all monolith deps (express, cors, cookie-parser, dotenv,
   `@prisma/client`, `@prisma/adapter-mariadb`, prisma, ioredis, redis, bullmq, aws-sdk cognito/s3,
   aws-jwt-verify, nodemailer, multer, sharp, stopword, p-limit, uuid, + `@google/generative-ai`,
   `@pinecone-database/pinecone`, `@payos/node` for later). **Add:** `tsyringe`, `reflect-metadata`,
   `class-validator`, `class-transformer`, `eslint` + `@typescript-eslint/*` + `eslint-config-prettier`.
   Scripts mirror monolith (`dev`/`build`/`start`).
2. **tsconfig.json** — copy monolith's, then **ADD `"experimentalDecorators": true` and
   `"emitDecoratorMetadata": true`** (without these, DI + validation decorators silently fail at runtime).
   Keep ES2022/CommonJS/strict/`paths {"@/*":["./src/*"]}`.
3. **prisma/** — copy `schema.prisma` (generator `output = "../src/generated"`) + `prisma.config.ts`
   verbatim; `.env` `DATABASE_URL`/`DB_*` → same MariaDB; run `prisma generate` only.
4. **Dockerfile / .dockerignore / .env.example** — copy monolith's; fix the two latent bugs
   (`EXPOSE 8080`, `CMD ["npm","start"]`); if parallel-running, map host port `8081:8080`.
   Copy `.env.example` (vnbk has none today).
5. **.prettierrc** copied; add minimal flat ESLint config + the module-boundary `no-restricted-imports` rule.
6. **Spine:** `main.ts` imports `reflect-metadata` first → `Application.bootstrap()` builds the
   tsyringe container, registers `PrismaProvider`, mounts Express (cors, cookie-parser, json,
   RequestLogger) + `AppRouter` with `GET /health` → `{status:"ok"}` + DB ping. Proves
   decorators+DI+Prisma+Express+build+Docker end-to-end.

Then lift the kernel: port `errors/*` → `shared/error/*` (one file each), `utils/response.ts`
`ResponseHelper`→`shared/http/ResponseEnvelope` + `ErrorHandler`→`http/middleware/ErrorHandlerMiddleware`,
`authMiddleware`→`AuthGuard`, `requireRole`→`RolesGuard` (injected `IUserService`+`ICacheService`,
no `registry.ts`). Build `infrastructure/` ports needed by the slice: `PrismaProvider`,
`RedisCacheService`, `CognitoProvider`, `S3Storage`, `SmtpMailSender`.

## Phase 1 — Reference module + recipe

Build **`user`** fully (simplest core-slice module: domain `User`, DTOs, `IUserRepository`+`UserDao`,
`IUserService`+`UserServiceImpl`, `UserController`/`UserRouter`, mappers, `UserModule`, tokens,
validation). This locks the canonical vertical. **Write `vnbk-service/RECIPE.md`** documenting the
exact steps + file template to add any module — this is the deliverable that lets remaining leaves
be ported mechanically.

## Phases 2-4 — Core slice (dependency order)

- **Phase 2 — Identity:** `auth` (depends on user, `CognitoProvider`, `SmtpMailSender`/email handler, oauth).
- **Phase 3 — Inventory:** `pricing` (give it a real `IPricingRepository` — the monolith injects raw
  Prisma; optionally Strategy-decompose `quote()`) → `image` (minimal: `S3Storage` + Image domain,
  needed by accommodation/room) → `room` (depends on pricing; cache) → `accommodation` (raw `$queryRaw`
  stats stay **inside `AccommodationDao`** behind `getStatsRows(...)`; `acc:detail:` read-through cache
  via `@Cacheable`/`ICacheService`; holiday opt-ins).
- **Phase 4 — Transactions:** `booking` — resolves the cycle (narrow ports + events), integrates
  pricing quote + `BookingTimeoutProducer`, email via `BookingConfirmedEvent`/`BookingCancelledEvent`.

## Beyond committed scope (recipe-driven, later)

`review`+`review-summary` (Gemini/Pinecone ports + worker), `payment` (PayOS port), `owner`/`owner-pricing`,
`search` (Pinecone+Redis), `favourite`, `amenity`, `facility`; the 3 BullMQ workers
(`BookingTimeoutWorker`/`ReviewWorker`/`PublishWorker` as injectable `IBaseWorker` classes under
`infrastructure/queue/` + per-domain producers); the 3 utility scripts. Each follows `RECIPE.md`.

## Hard-to-port specifics

- **Conditional-include generics** (`findById<T extends boolean>(id, withDetails)`): replace with
  **explicit methods** — `findById(id)` + `findByIdWithDetails(id)` (same for user/booking) returning
  domain models; the conditional leakage disappears behind the DAO.
- **Raw SQL** (`accommodation.repository.ts` `$queryRaw`): stays inside `AccommodationDao`, exposed as a
  typed `getStatsRows(filters, page): AccommodationStatsRow[]`. Fix the table-name TODOs via constants.
- **Caching:** one `ICacheService` port (`RedisCacheService`); read-through caches (acc-detail) via a
  `@Cacheable` decorator; counters/role via explicit calls. **Never cache inside the DAO.**
- **External clients:** each behind a port + `@singleton()` impl in `infrastructure/` (container owns
  the instance, replacing static `getInstance()`); domains inject the interface token.

---

## Files: lift / reference

- **Lift into kernel:** `monolith-service/src/errors/*` → `shared/error/*`;
  `src/utils/response.ts` → `shared/http/ResponseEnvelope` + `http/middleware/ErrorHandlerMiddleware`;
  `src/middlewares/{auth,role}.middleware.ts` → `http/middleware/{AuthGuard,RolesGuard}`.
- **Highest-signal references** to mirror/refactor:
  `src/index.ts` (DI graph + setter cycle → tsyringe + `IModule`),
  `src/services/booking.service.ts` (→ `Booking` domain + `BookingServiceImpl` + factory + events),
  `src/repositories/booking.repository.ts` (→ `BookingDao` behind `IBookingRepository`, split generics),
  `src/services/pricing.service.ts` (→ Strategy rules),
  `src/repositories/accommodation.repository.ts` (→ `AccommodationDao`, encapsulated `$queryRaw`).

## Verification

- **Phase gate:** each phase ends with a runnable service; smoke-test new endpoints
  (`vitest`/`node:test`) asserting status + `{success,data,error}` envelope.
- **Parallel-run behavioral diff (main safety net):** run monolith on `:8080` and vnbk on `:8081`
  against the **same DB**; script representative requests (public reads: accommodation detail, facility
  list; authed flow with a test user: booking draft→confirm→cancel) and **diff JSON field-by-field**.
  Same schema + envelope ⇒ responses match modulo ordering/timestamps.
- **Unit tests** only for genuinely tricky pure logic: pricing decimal math / HCM-timezone night
  enumeration / quote hashing, and booking domain transitions (`cancel`/`confirm`/`isCancellable`).
- **Guardrail:** vnbk runs `prisma generate` only (never migrate/push) so it cannot mutate the shared schema.
