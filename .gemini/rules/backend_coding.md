# Backend Coding Rules

These rules define the "Golden Path" for backend development in the Vinabooking monolith.

## 1. Architectural Pattern: Controller-Service-Repository
Every feature must follow the strict separation of concerns described in [System Architecture](../../docs/architecture/README.md).

- **Controllers**: Handle HTTP-specific logic, input validation, and orchestration.
  - **Rule**: Never include business logic or direct Prisma calls in controllers.
  - **Reference**: `AccommodationController.getById` in [accommodation.controller.ts:37](../../API/monolith-service/src/controllers/accommodation.controller.ts).
- **Services**: Contain all core business logic and integration orchestration.
  - **Rule**: All multi-step operations or external API calls (S3, Cognito) must reside here.
  - **Reference**: `AccommodationService.getAccommodationById` in [accommodation.service.ts:50](../../API/monolith-service/src/services/accommodation.service.ts).
- **Repositories**: Abstraction for database operations.
  - **Rule**: Use the generated Prisma client exclusively. Avoid complex logic; focus on data access.
  - **Reference**: `AccommodationRepository` in [accommodation.repository.ts](../../API/monolith-service/src/repositories/accommodation.repository.ts).

## 2. Dependency Injection
Use constructor injection for dependencies. Services and Repositories are instantiated and exported via a central registry.

- **Rule**: Always use `#` for private read-only members for dependencies.
- **Reference**: `readonly #accommodationService: AccommodationService` in [accommodation.controller.ts:21](../../API/monolith-service/src/controllers/accommodation.controller.ts).
- **Rule**: Register new services and repositories in `registry.ts`.
- **Reference**: [registry.ts](../../API/monolith-service/src/registry.ts).

## 3. Standardized Responses
Use the `ResponseHelper` utility to ensure consistent API response shapes.

- **Rule**: Use `ResponseHelper.success(res, data)` for successful responses.
- **Reference**: [accommodation.controller.ts:40](../../API/monolith-service/src/controllers/accommodation.controller.ts).
- **Rule**: Responses must match the `ApiResponse<T>` type defined in [responses.ts](../../API/monolith-service/src/types/responses.ts).

## 4. Error Handling
Never use generic `Error` objects. Use the specialized subclasses defined in `src/errors/`.

- **Rule**: Throw `NotFoundError`, `BadRequestError`, or `ForbiddenError` to trigger the global error handler.
- **Reference**: [accommodation.service.ts:2](../../API/monolith-service/src/services/accommodation.service.ts).

## 5. Prisma Guidelines
- **Rule**: Always use the generated types from `@/generated/client`.
- **Rule**: Use `batch` operations (e.g., `createMany`, `findMany`) when dealing with multiple records.
- **Reference**: `findByIdBatch` in [accommodation.repository.ts](../../API/monolith-service/src/repositories/accommodation.repository.ts).
