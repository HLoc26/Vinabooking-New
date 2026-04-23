# Vinabooking API Context

This file provides specialized context for the Vinabooking backend monolith.

## Overview
The backend is a Node.js monolith built with Express and TypeScript. It handles all business logic, database interactions, and integrations with external services like AWS and Redis.

## Tech Stack
- **Node.js & TypeScript**: Core runtime and language.
- **Express.js**: Web framework.
- **Prisma**: ORM for MySQL database management.
- **Redis**: Caching and potential session/queue management.
- **AWS S3**: Storage for accommodation and profile images.
- **AWS Cognito**: User authentication and identity management.
- **Multer & Sharp**: Image upload and processing.

## Architecture: Controller-Service-Repository
The codebase follows a strict separation of concerns:
- **Routes (`src/routes/`)**: Defines API endpoints and links them to controllers.
- **Controllers (`src/controllers/`)**: Handles incoming requests, validates input, and calls services.
- **Services (`src/services/`)**: Contains the core business logic. Services are often injected with repositories and external clients.
- **Repositories (`src/repositories/`)**: Abstracts database operations using Prisma.
- **Clients (`src/clients/`)**: Wraps external service interactions (AWS, Redis).
- **Registry (`src/registry.ts`)**: (In some versions) used for dependency injection/management.

## Authentication & Authorization
- Uses **AWS Cognito** for the heavy lifting of user management.
- **Middlewares (`src/middlewares/`)**:
  - `auth.middleware.ts`: Verifies JWTs from Cognito.
  - `role.middleware.ts`: Enforces role-based access control (TRAVELER, OWNER, ADMIN).

## Key Workflows

### 1. Image Upload
1. Controller receives file via Multer.
2. `UploadService` processes the image using `Sharp`.
3. Image is uploaded to **AWS S3** via `S3Service`.
4. Metadata is stored in the database via `ImageRepository`.

### 2. Booking Process
1. `BookingService` validates availability.
2. Creates a booking record.
3. Triggers notifications (e.g., via `EmailService`).

## Commands
- `npm run dev`: Starts the server with `nodemon` and `ts-node`.
- `npm run build`: Compiles TypeScript to JavaScript.
- `npx prisma db push`: Syncs the Prisma schema with the database.
- `npx prisma studio`: Visual interface for database management.

## Environment Variables
Crucial variables in `.env`:
- `DATABASE_URL`: Prisma connection string.
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.
- `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`.
- `S3_BUCKET_NAME`.
- `REDIS_HOST`, `REDIS_PORT`.
