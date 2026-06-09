# Module Recipe — how to add a feature module to `vnbk-service`

This is the canonical, verified pattern. The **`user`** module (`src/modules/user/`) is the
reference implementation — copy its shape. Every module is a vertical slice with the same layers.

## Golden rules

1. **One class/interface per file.** File name == type name (PascalCase). Use **named exports**.
2. **I-prefix interfaces, suffixed impls:** `IFooService`+`FooServiceImpl`, `IFooRepository`+`FooDao`.
3. **Three model concepts, never mixed:**
   - **Prisma entity** (`@/generated/client`) — only `dao/` and `dao/mapper/` may import it.
   - **Domain model** (`domain/`) — rich class, invariants + behavior, extends `AggregateRoot`/`Entity`.
   - **DTO** (`dto/request|response/`) — request DTOs are classes with class-validator decorators.
4. **Depend on abstractions.** Constructor-inject interfaces via tsyringe tokens (`@inject(TOKEN)`).
   Concrete helper classes (mappers, guards) can be injected directly (they're `@injectable()`).
5. **Module sealing.** Other modules import this one ONLY via its `index.ts` barrel
   (service interface, tokens, DTOs, domain types you choose to expose, ports, events).
   Never import another module's `dao/`, `domain/`, `repository/`, or `service/impl/`.
6. **No Prisma type leaves the DAO.** Repositories return domain models; mappers translate.
7. **DAOs extend `BaseDao`** and wrap every Prisma call in `this.run(async () => …)` so Prisma
   errors become `AppError`s (P2002→409, P2025→404).

## Folder layout (per module)

```
modules/<name>/
  domain/            <Name>.ts                        # aggregate root + entities
  enums/             E<Thing>.ts                       # const-object + union type (mirror Prisma enum)
  dto/request/       <Verb><Name>Request.ts            # class-validator decorated classes
  dto/response/      <Name>Response.ts
  repository/        I<Name>Repository.ts              # INTERFACE (port), domain-typed
  dao/               <Name>Dao.ts                       # implements I<Name>Repository (Prisma)
  dao/mapper/        <Name>EntityMapper.ts             # Prisma entity <-> domain
  service/           I<Name>Service.ts                  # INTERFACE (use-case contract)
  service/           <Name>Factory.ts (optional)        # domain-creation factory
  service/port/      I<Other>Lookup.ts (optional)       # narrow ports this module needs from others
  service/impl/      <Name>ServiceImpl.ts
  rest/              <Name>Controller.ts  <Name>Router.ts
  rest/mapper/       <Name>DtoMapper.ts                 # domain <-> DTO
  events/            <Name><Event>Event.ts (optional)
  <name>.tokens.ts   SERVICE / REPOSITORY symbols
  <Name>Module.ts    implements IModule
  index.ts           public barrel
```

## Enum pattern (friction-free with Prisma)

Define domain enums as a **const object + union type**, mirroring the generated Prisma enum's string
values. This makes domain↔persistence assignment structural (no casts) while keeping `domain/` free
of `@/generated` imports. See `modules/user/enums/ERole.ts`:

```ts
export const ERole = { TRAVELLER: "TRAVELLER", ACCOMMODATION_OWNER: "ACCOMMODATION_OWNER" } as const;
export type ERole = (typeof ERole)[keyof typeof ERole];
```

## Domain model pattern

Extend `AggregateRoot` (has id, equality, `addDomainEvent`/`pullDomainEvents`). Private constructor;
expose `static create(...)` (new, enforces invariants) and `static rehydrate(props)` (from
persistence). Getters expose state; mutators enforce rules. See `modules/user/domain/User.ts`.

## Request DTO + validation

Request DTOs are **classes** with class-validator decorators (`@IsString`, `@IsEmail`, `@IsEnum`,
`@IsInt`, `@Min`, `@ValidateNested` + `@Type`, `@IsOptional`). The `ValidationPipe`
(`src/http/middleware/ValidationPipe.ts`) runs them: `this.validate.body(CreateXRequest)` →
`req.validatedBody`. Shape/format only; business rules live in the domain/service.

## Repository (port) + DAO (impl)

`I<Name>Repository` declares domain-typed methods. Replace conditional-include generics with
**explicit methods** (`findById` vs `findByIdWithDetails`). `<Name>Dao extends BaseDao implements
I<Name>Repository`, injects `PrismaProvider` + `<Name>EntityMapper`, wraps calls in `this.run(...)`.
See `modules/user/dao/UserDao.ts`.

## Entity mapper

`@injectable()` class implementing `IMapper<Domain, PrismaEntity>`: `toDomain(entity)`,
`toCreateInput(domain): Prisma.XCreateInput`, `toUpdateInput(domain): Prisma.XUpdateInput`.
Raw `$queryRaw` and table-name constants stay encapsulated here / in the DAO.

## Service (port) + impl

`I<Name>Service` is the use-case contract (may accept request DTOs, returns domain models).
`<Name>ServiceImpl` is `@injectable()`, injects the repository + other modules' service interfaces
via tokens. Orchestration only — push rules into the domain. Cross-module side effects (email,
re-index) go through `IDomainEventPublisher` (`@inject(EVENT_PUBLISHER)`), not direct calls.

## REST: controller + router

- `<Name>Controller extends BaseController` (`@injectable()`): each endpoint is an arrow field
  `= this.handle<TResponse>(async (req) => { … return this.ok(dto) / this.created(dto); })`.
  Use `this.requireUserId(req)` for the authenticated id. **No try/catch** — throw `AppError`s;
  `BaseController.handle` forwards to the global error handler and wraps `ResponseEnvelope`.
- `<Name>Router extends BaseRouter` (`@injectable()`): inject controller + `AuthGuard` +
  `ValidationPipe`. Implement `get basePath()` and `registerRoutes()`. **Call `this.registerRoutes()`
  at the END of the constructor**, after `super()` (base-class constructor can't see subclass fields).
  Compose middleware: `this.router.post("/", this.validate.body(Dto), this.controller.create)`,
  protect with `this.auth.handle`.

## Tokens + module + barrel

```ts
// <name>.tokens.ts
export const X_SERVICE = Symbol("IXService");
export const X_REPOSITORY = Symbol("IXRepository");

// <Name>Module.ts
export class XModule implements IModule {
  register(c: DependencyContainer): void {
    c.registerSingleton(X_REPOSITORY, XDao);
    c.registerSingleton(X_SERVICE, XServiceImpl);
    c.registerSingleton(ROUTER, XRouter);          // mounted by AppRouter at basePath
  }
}

// index.ts — public surface only
export type { IXService } from "@/modules/x/service/IXService";
export { X_SERVICE } from "@/modules/x/x.tokens";
export { XModule } from "@/modules/x/XModule";
// + DTOs / domain types / ports / events other modules legitimately need
```

## Wire into the app

Add the module to `Application.modules` in dependency order:
`return [new InfrastructureModule(), new UserModule(), new XModule()];`

## Infrastructure ports available (inject by token)

- `CACHE_SERVICE` → `ICacheService` (Redis) — read-through caches, counters, role cache.
- `TOKEN_VERIFIER` → `ITokenVerifier` (Cognito JWT) — used by `AuthGuard`.
- `EVENT_PUBLISHER` → `IDomainEventPublisher` (in-process, synchronous).
- (added as needed) `MAIL_SENDER` → `IMailSender`, `OBJECT_STORAGE` → `IObjectStorage`.
  Add a new port as `infrastructure/<area>/I<Port>.ts` + `<Adapter>.ts` (`@singleton()`),
  a token in `infrastructure/infrastructure.tokens.ts`, and bind it in `InfrastructureModule`.

## Verify

`npx tsc --noEmit` (must be clean) → `npx tsc && npx tsc-alias` → run
`PORT=8099 node dist/src/main.js` and curl the endpoints. Assert the `{success,data,error}` envelope,
status codes, validation 400s, auth 401s, and (with the DB up) a real persistence round-trip —
exactly as done for the user module.
