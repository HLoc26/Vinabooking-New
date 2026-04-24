# ADR 0001: Use Monolith over Microservices

## Status
Accepted

## Context
The project initially explored a microservices architecture using gRPC. While microservices offer scalability and isolation, they also introduce significant complexity in terms of deployment, local development, and cross-service communication. With a **small team of only three people**, managing multiple independent services became redundant and created a high maintenance burden that slowed down development.

## Decision
We decided to consolidate the backend into a single **Node.js Monolith** using Express.js to maximize team efficiency and simplify the architecture.

## Rationale
1.  **Team Efficiency**: With 3 developers, the overhead of microservices (proto management, service discovery) outweighed the benefits.
2.  **Reduced Maintenance**: Maintaining one codebase is more practical for a small team than managing 4+ microservices.
3.  **Faster Development**: Feature delivery is faster when changes don't require coordinated updates across multiple service repositories and proto definitions.
4.  **Simplified Local Development**: The entire stack can be run on a single machine with minimal resource overhead.
5.  **Data Integrity**: Shared database access via Prisma simplifies transaction management.

## Consequences
- **Scaling**: We will scale vertically or by running multiple instances of the same monolith.
- **Code Organization**: We must be disciplined with internal boundaries (Services, Repositories) to allow for potential future extraction of services if needed.
- **Dependency Management**: All dependencies are now in one `package.json`.
