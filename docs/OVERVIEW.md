# Vinabooking Project Overview

Vinabooking is a comprehensive online accommodation booking platform designed to connect travellers with property owners.

## Mission
To provide a seamless, secure, and intuitive experience for users to find and book unique stays, while empowering owners with robust tools to manage their properties.

## Documentation Index

Explore our documentation to understand the system:

- **[Onboarding](./onboarding/README.md)**: Get started with local development and setup instructions.
- **[Architecture](./architecture/README.md)**: Learn about the tech stack, monolith structure, and frontend architecture.
- **[API](./api/README.md)**: Overview of the RESTful API endpoints and authentication.
- **[Database](./database/README.md)**: Detailed view of the MySQL schema managed by Prisma.
- **[Business Rules](./business-rules/README.md)**: Understanding roles, booking flows, and review eligibility.
- **[Testing](./testing/README.md)**: Our strategy for maintaining quality.
- **[Decisions (ADRs)](./decisions/)**:
    - [0001: Monolith over Microservices](./decisions/0001-use-monolith-over-microservices.md)
    - [0002: AWS Cognito for Auth](./decisions/0002-use-aws-cognito-for-auth.md)

## Tech Stack Summary

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, TypeScript, Vite, Material UI, Redux, React Query |
| **Backend** | Node.js, Express.js, TypeScript, Prisma ORM |
| **Database** | MySQL |
| **Cache** | Redis |
| **Identity** | AWS Cognito |
| **Storage** | AWS S3 |
| **Infrastructure** | Docker, Docker Compose |
