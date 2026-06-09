# Lộc — Platform, Identity & Intelligence

**Git identity:** Đặng Hữu Lộc `<dhl26052004@gmail.com>` (lead, 1216 commits)
**Original timeline:** scaffold & identity (Jan 22–Feb 3) → image → AI/search (Apr 27–May 3) → dynamic pricing (May 18+)

You built the **foundation** (project scaffold, DI wiring, Prisma, clients, errors, middleware,
response envelope), the **identity stack** (auth/oauth/user), **image**, the **AI/search** stack,
and **dynamic pricing**. Below, each feature maps your monolith files to their vnbk-service homes.

> Legend: ✅ = converted, ⏳ = deferred (follow `API/vnbk-service/RECIPE.md`).

---

## Feature 1 — Project scaffold & DI composition ✅
*Monolith: 01-22 "initialize monolith folder", 01-30 "update index.ts to initialize all classes for DI".*

The monolith hand-wired every `new XRepository(prisma)` / `new XService(...)` in `index.ts`, with
`setAccommodationService()` / `setPricingService()` setter hacks for circular deps. That's replaced
by a **tsyringe container + per-module registration**.

| Monolith | vnbk-service | Note |
|---|---|---|
| `src/index.ts` (208-line DI graph + `app.listen`) | `src/main.ts` + `src/Application.ts` | `Application` is the composition root; `main.ts` just imports `reflect-metadata` then boots. |
| manual `new` chain + `setX()` setters | `src/di/container.ts`, `src/di/IModule.ts`, each module's `XModule.ts` | No setters. Each module binds its tokens; cycle eliminated by design. |
| `routes/index.routes.ts` (`AppRouter`) | `src/http/AppRouter.ts` + `src/http/IRouter.ts` + `src/http/http.tokens.ts` | Routers self-register under the `ROUTER` token; `AppRouter` mounts them. |
| CORS/cookie/json/logging in `index.ts` | `src/Application.ts` (`configureMiddleware`) + `src/http/middleware/RequestLogger.ts` | |

**Investigate/learn:** `src/Application.ts` (the `modules` list + `mountRoutes`), `src/di/IModule.ts`,
and any `XModule.ts` to see `container.registerSingleton(TOKEN, Impl)`. This is the single biggest
change from your `index.ts`.

---

## Feature 2 — Persistence, config, errors, response envelope ✅
*Monolith: 01-30 "prisma client with db configs", 01-30 "response helper", 02-03 "global error handling".*

| Monolith | vnbk-service | Note |
|---|---|---|
| `src/clients/prisma.client.ts` (singleton + mariadb adapter) | `src/infrastructure/persistence/PrismaProvider.ts` | Now a `@singleton()`; DAOs inject it. |
| `prisma/schema.prisma`, `prisma.config.ts` | copied **byte-for-byte** to `API/vnbk-service/prisma/` | Same DB; generator → `src/generated`. |
| `src/errors/*` (AppError + subclasses, default exports) | `src/shared/error/*` (named exports, +`UnauthorizedError`) | Same hierarchy. |
| `src/utils/response.ts` (`ResponseHelper`, `ErrorHandler`) | `src/shared/http/ResponseEnvelope.ts` + `src/http/middleware/ErrorHandlerMiddleware.ts` + `src/shared/http/ApiResponse.ts` | Same `{success,data,error}` envelope. |
| scattered `process.env[...]` | `src/config/AppConfig.ts` | typed `getRequired`/`getNumber`. |
| (new) | `src/infrastructure/persistence/BaseDao.ts` + `PrismaErrorTranslator.ts` | DAOs wrap calls in `this.run(...)`; P2002→409, P2025→404. **New pattern — learn it.** |
| (new) | `src/shared/domain/{Entity,AggregateRoot}.ts`, `src/shared/mapper/IMapper.ts`, `src/http/{BaseController,BaseRouter,HttpResult}.ts` | The base classes every module extends. |

**Investigate/learn:** `BaseController.handle()` (Template Method that wraps the envelope + forwards
errors — no more per-method try/catch) and `BaseDao.run()`.

---

## Feature 3 — User + Favourite-list bootstrap ✅
*Monolith: 01-22/24 user repo/service, "overloading cases for getting user with/without fav list".*

| Monolith | vnbk-service |
|---|---|
| `repositories/user.repository.ts` (incl. `getRoleById`, `findOne<T extends boolean>` include-generics) | `modules/user/repository/IUserRepository.ts` + `modules/user/dao/UserDao.ts` |
| `services/user.service.ts` (cacheUser, saveUserFromCache) | `modules/user/service/IUserService.ts` + `service/impl/UserServiceImpl.ts` (`cachePendingUser`/`savePendingUser`) |
| `controllers/user.controller.ts`, `routes/user.routes.ts` | `modules/user/rest/UserController.ts` + `rest/UserRouter.ts` |
| `types/dtos/get-user.dto.ts`, `cache-user-info.dto.ts` | `modules/user/dto/request/*`, `dto/response/UserResponse.ts`, `domain/User.ts` |
| `ERole` (Prisma) used directly | `modules/user/enums/ERole.ts` (const-object mirror) |

**Investigate/learn:** how the `findById<T extends boolean>(withFavourites)` conditional-include
generic became **explicit methods**, and how `User.create()` vs `User.rehydrate()` work
(`modules/user/domain/User.ts`). The default-favourite-list creation now lives in
`UserEntityMapper.toCreateInput`.

---

## Feature 4 — Auth (Cognito credentials) + Google OAuth ✅
*Monolith: 01-25 CognitoClient/auth.service/oauth.service, 01-30 auth controller/router, 02-02 auth middleware.*

| Monolith | vnbk-service | Note |
|---|---|---|
| `clients/cognito.client.ts` | `infrastructure/auth-idp/CognitoIdpClient.ts` | `@singleton`, lazy; exposes signUp/confirm/login/refresh/forgot etc. |
| `utils/jwt.ts` (`JwtService.verifyToken`) | `infrastructure/auth-idp/CognitoTokenVerifier.ts` (+ `ITokenVerifier.ts`) and `modules/auth/service/JwtDecoder.ts` | verify is now a **port**; `AuthGuard` injects it. |
| `middlewares/auth.middleware.ts` | `src/http/middleware/AuthGuard.ts` | injectable class; `this.auth.handle`. |
| `middlewares/role.middleware.ts` (Redis role cache) | role cache now in `UserServiceImpl.getRole()` + `infrastructure/cache/{ICacheService,RedisCacheService}.ts` | RolesGuard itself ⏳ not yet built. |
| `services/auth.service.ts` | `modules/auth/service/IAuthService.ts` + `service/impl/AuthServiceImpl.ts` |
| `services/oauth.service.ts` | `modules/auth/service/IOAuthService.ts` + `service/impl/OAuthServiceImpl.ts` |
| `repositories/auth.repository.ts` (UserAuthProvider) | `modules/auth/repository/IAuthProviderRepository.ts` + `dao/AuthProviderDao.ts` + `domain/AuthProvider.ts` |
| `controllers/auth.controller.ts`, `routes/auth.routes.ts` | `modules/auth/rest/{AuthController,AuthRouter}.ts` |
| `types/requests/auth.request.ts`, `types/responses/auth.response.ts`, `types/auth/*` | `modules/auth/dto/request/*` (class-validator), `dto/response/*`, `enums/EProvider.ts` |
| `redis.client.ts` | `infrastructure/cache/RedisCacheService.ts` |

**Investigate/learn:** the sign-up/confirm orchestration in `AuthServiceImpl` (cognito.signUp →
`userService.cachePendingUser` → on confirm `savePendingUser` + create auth provider). Note the
verify flow: `ITokenVerifier.verify` returns only `{ sub }`; `JwtDecoder` reads extra claims.
Cookie/redirect endpoints are raw handlers (not `this.handle`) because they need `res`.

---

## Feature 5 — Image upload, S3, variants ✅
*Monolith: 02-02 s3 client/upload client/image processor/repo/services/controller/routes; 02-21 batch retrieval.*

| Monolith | vnbk-service | Note |
|---|---|---|
| `clients/s3.client.ts` | `infrastructure/storage/S3Storage.ts` (+ `IObjectStorage.ts`) | low-level put/delete/url is now a port. |
| `clients/upload.client.ts` (multer) | `infrastructure/storage/MulterProvider.ts` | |
| `services/s3.service.ts` (variant keys + upload) | `modules/image/service/impl/ImageServiceImpl.ts` (key building moved here) + the `IObjectStorage` port | entity/variant logic is now in the image service, not the S3 adapter. |
| `utils/image-processor.ts`, `utils/image.ts` | `modules/image/service/impl/{ImageProcessorImpl,CreateThumbnailStep,CreateWebpStep,CreateOptimizedStep}.ts` (+ `IImageProcessor`, `IImageProcessingStep`) | sharp pipeline became Strategy steps. |
| `services/image.service.ts`, `services/upload.service.ts` | `modules/image/service/{IImageService,impl/ImageServiceImpl}.ts` | `getImagesByEntities` = old `getImagesBatch`. |
| `repositories/image.repository.ts` | `modules/image/repository/IImageRepository.ts` + `dao/ImageDao.ts` |
| `controllers/image.controller.ts`, `routes/image.routes.ts` | `modules/image/rest/{ImageController,ImageRouter,EntityTypeParam}.ts` |
| `types/image.types.ts` | `modules/image/dto/response/*`, `domain/{Image,ImageReference,ImageVariant}.ts`, `enums/{EEntityType,EVariantType}.ts` |

**Investigate/learn:** the image-processing **Strategy** (`IImageProcessingStep` + the three step
classes) and how `ImageDtoMapper` injects `IObjectStorage` to attach full URLs.

---

## Feature 6 — Dynamic Pricing (quote engine + owner settings/holidays) ✅
*Monolith: 05-18+ pricing.service / owner-pricing.service / holiday.repository (the `dynamic-pricing.md` feature).*

| Monolith | vnbk-service | Note |
|---|---|---|
| `services/pricing.service.ts` (`quote()`: holiday multipliers, long-stay/early-bird discounts, floor price, HCM-tz nights, quote hash) | `modules/pricing/service/{IPricingService,impl/PricingServiceImpl}.ts` + helpers `service/NightCalendar.ts` (HCM-tz nights) + `service/QuoteHasher.ts` | took a real `IPricingRepository` instead of raw Prisma. |
| `services/owner-pricing.service.ts` | `modules/pricing/service/{IOwnerPricingService,impl/OwnerPricingServiceImpl}.ts` |
| `repositories/holiday.repository.ts` (+ raw Prisma in pricing) | `modules/pricing/repository/IPricingRepository.ts` + `dao/PricingDao.ts` + `dao/mapper/PricingEntityMapper.ts` |
| `types/pricing.types.ts`, `utils/pricing-validation.ts`, `constants/booking.ts` | `modules/pricing/dto/request|response/*` (validation now in class-validator DTOs), `domain/{Money,Holiday,HolidayOptIn,DynamicPricingSettings,PriceableItem}.ts`, `enums/{EItemType,EPricingType}.ts` |
| `controllers/pricing.controller.ts`, `routes/pricing.routes.ts` | `modules/pricing/rest/{PricingController,PricingRouter,mapper/PricingDtoMapper}.ts` |

**Investigate/learn:** `PricingServiceImpl.quote()` + `NightCalendar` + `QuoteHasher` — the decimal/
timezone/holiday math was ported faithfully (decimals via `domain/Money.ts`). `IPricingService.quote`
is the contract `booking` consumes. Owner routes are auth-only (RolesGuard ⏳ pending) — ownership is
enforced by resolving the owner profile.

---

## Feature 7 — Semantic Search (Pinecone + Gemini) ⏳ DEFERRED
*Monolith: 04-27 AI clients/queue/worker, 05-02/03 search service/controller/routes, coordinate search.*

Not yet in vnbk-service. **Follow `RECIPE.md`** to build `modules/search` + new infrastructure ports.

| Monolith (to port) | Suggested vnbk-service target |
|---|---|
| `clients/pinecone.client.ts` | `infrastructure/vector/{IVectorIndex,PineconeIndex}.ts` (port + `@singleton`) |
| `clients/gemini.client.ts`, `utils/ai-limiter.ts` | `infrastructure/ai/{IEmbeddingModel,IGenerativeModel,GeminiProvider}.ts` |
| `services/search.service.ts` (semantic + bounding-box + Redis cache) | `modules/search/service/{ISearchService,impl/SearchServiceImpl}.ts` (cache via `ICacheService`) |
| `controllers/search.controller.ts`, `routes/search.routes.ts` | `modules/search/rest/*` |
| `types/search.types.ts` | `modules/search/dto/*` |
| `scripts/sync-*.ts` | one-off scripts under `vnbk-service/src/scripts/` |

**Investigate/learn before porting:** `infrastructure/cache/ICacheService.ts` (for the search cache),
and how `modules/accommodation` exposes data you'll index. Decide a `@Cacheable`-style cache or
explicit `ICacheService` calls.

---

## Feature 8 — Review AI-summary + background workers ⏳ DEFERRED
*Monolith: 04-27/29 queue infra, review worker, review-summary repo/service, AI summarization.*

| Monolith (to port) | Suggested vnbk-service target |
|---|---|
| `clients/queue.client.ts`, `workers/*` (`WorkerManager`, review/publish/booking-timeout) | `infrastructure/queue/{QueueRegistry,*Producer}.ts` + worker classes implementing an `IWorker` port |
| `services/review-summary.service.ts`, `repositories/review-summary.repository.ts`, `types/queue.types.ts` | a `review` module (owned with Huy) + `infrastructure/ai` |
| `booking-timeout.worker.ts` | replaces `modules/booking/service/impl/LoggingBookingTimeoutScheduler.ts` (currently a stub) |

**Investigate/learn:** `modules/booking/service/IBookingTimeoutScheduler.ts` (the port the real BullMQ
worker must implement) and `shared/events/` (workers can react to domain events).

---

## Your fastest path in
1. `src/Application.ts` + `src/di/IModule.ts` — see your old `index.ts` reborn.
2. `src/modules/user/` then `src/modules/auth/` — your identity stack, fully converted.
3. `src/infrastructure/` — every client you wrote is now a port + singleton adapter here.
4. When you pick up search/workers, follow `RECIPE.md` + the `modules/pricing` example (closest in shape).
