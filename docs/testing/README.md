# Testing Strategy

This document outlines the approach for ensuring quality and reliability across the Vinabooking application.

## Current State

*Note: Automated tests are currently in development. The focus is on implementing core features and establishing a robust architecture.*

## Proposed Strategy

### 1. Unit Testing
- **Backend**: Use **Jest** for testing individual services and utility functions. Focus on business logic in `src/services/`.
- **Frontend**: Use **Vitest** for testing hooks and utility functions.

### 2. Integration Testing
- **Backend**: Test API endpoints using **Supertest**, mocking database calls with Prisma's mock client or using a dedicated test database.
- **Frontend**: Use **React Testing Library** to verify component behavior and interactions.

### 3. End-to-End (E2E) Testing
- Use **Playwright** or **Cypress** to test critical user journeys:
    - User registration and login.
    - Searching for an accommodation.
    - Completing a booking flow.
    - Owner property management.

### 4. Database Verification
- Ensure schema migrations are tested against a clean environment before merging.
- Use `npx prisma db push` only in development; use migrations for production-like environments.

## Running Tests

Once implemented, the following commands will be available:

```bash
# Backend
npm run test

# Frontend
npm run test
```
