---
name: backend-add-resource
description: Scaffold a new REST API resource (Repository, Service, Controller, Router) following the monolith's architectural patterns and dependency injection. Use when the user wants to "add an endpoint", "create a REST API", or "implement the backend for X".
---

# backend-add-resource

This skill automates the creation of a new backend resource following the project's **Controller-Service-Repository** pattern.

## Guidelines

- **Architecture**: Always follow the patterns in [Backend Coding Rules](../../rules/backend_coding.md) and [System Architecture](../../../docs/architecture/README.md).
- **Security**: Refer to [Security & Authentication Rules](../../rules/security.md) to determine if the resource needs protection (`authMiddleware`, `requireRole`).
- **Data Access**: Use the [Database Schema](../../../docs/database/README.md) as a reference for entity relationships.

## Workflow

1.  **Define Requirements**:
    - Identify resource name and fields (CRUD operations).
    - Determine Auth policy: Public, Authenticated, or Role-specific (e.g., `ACCOMMODATION_OWNER`).
2.  **Scaffold Repository**: Create `src/repositories/[resource].repository.ts`.
3.  **Scaffold Service**: Create `src/services/[resource].service.ts` using constructor injection.
4.  **Scaffold Controller**: Create `src/controllers/[resource].controller.ts` using `ResponseHelper`.
5.  **Define Routes**: Create `src/routes/[resource].routes.ts` and apply necessary middleware.
6.  **Register Dependencies**:
    - Update `src/registry.ts` to instantiate and export the new Repository and Service.
7.  **Mount Router**:
    - Update the main router (usually `src/index.ts` or `src/routes/index.ts`) to mount the new resource path.
