# System Architecture

Vinabooking is designed as a full-stack application with a monolithic backend and a single-page application (SPA) frontend.

## High-Level Overview

- **Frontend**: A React application built with Vite, TypeScript, and Material UI.
- **Backend**: A Node.js monolithic service using Express.js and Prisma ORM.
- **Database**: MySQL for relational data storage.
- **Cache**: Redis for session management and performance optimization.
- **Authentication**: AWS Cognito handles user identity, registration, and login.
- **Storage**: AWS S3 is used for storing uploaded images (accommodations, profiles).

## Backend Architecture

The backend follows the **Controller-Service-Repository** pattern:

1.  **Routes**: Defines API endpoints and applies middlewares (Auth, Role).
2.  **Controllers**: Handles request validation and orchestrates service calls.
3.  **Services**: Contains core business logic and integrates with external clients (S3, Cognito).
4.  **Repositories**: Abstraction layer for database operations using Prisma.
5.  **Clients**: Wrappers for external service integrations.

## Frontend Architecture

The frontend uses a **Feature-based** structure:

- **Features**: Located in `src/features/`, each directory contains components, hooks, services, and types specific to a domain (e.g., `auth`, `booking`, `accommodation`).
- **State Management**:
    - **Redux Toolkit**: For global UI state and persistent data (Auth, Booking drafts).
    - **TanStack Query (React Query)**: For server-side state, caching, and synchronization.
- **Routing**: Handled by React Router (v7).

## Data Flow

1.  **User Request**: User interacts with the React UI.
2.  **Authentication**: UI interacts with AWS Cognito for tokens.
3.  **API Call**: UI sends requests to the Monolith Backend with a JWT bearer token.
4.  **Middleware**: Backend verifies the token using Cognito public keys.
5.  **Business Logic**: Controller calls Service -> Service calls Repository -> Repository queries MySQL.
6.  **Response**: Data is returned through the layers back to the UI.
