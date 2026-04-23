# Vinabooking — Gemini CLI Context

This document provides foundational guidance for Gemini CLI when working on the Vinabooking project.

## Core Mandates
- **Single Source of Truth**: `docs/` describes *what* the system is; `.gemini/rules/` describes *how* to write code.
- **Strict Architecture**: Follow the Controller-Service-Repository pattern for the backend and Feature-based architecture for the frontend.

## Coding Rules
Refer to the following specialized rules for detailed implementation guidelines:
- **[Backend Coding](.gemini/rules/backend_coding.md)**: DI, Prisma, Error handling.
- **[Frontend Coding](.gemini/rules/frontend_coding.md)**: React, Redux, TanStack Query, MUI.
- **[Security & Auth](.gemini/rules/security.md)**: Cognito, RBAC, Middleware.
- **[Testing & Quality](.gemini/rules/testing.md)**: Linting, TypeScript, Testing strategy.

## Key Directories
- `API/monolith-service/src/`: Backend source.
- `UI/src/`: Frontend source.
- `docs/`: System documentation.

## Commands
- **Backend Dev**: `cd API/monolith-service && npm run dev`
- **Frontend Dev**: `cd UI && npm run dev`
- **Sync Database**: `cd API/monolith-service && npx prisma db push`
- **Docker Full Stack**: `docker-compose up -d`
