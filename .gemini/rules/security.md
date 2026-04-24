# Security & Authentication Rules

These rules ensure the Vinabooking platform remains secure and compliant with the policies described in [Business Rules](../../docs/business-rules/README.md).

## 1. Authentication
We use AWS Cognito for user identity as documented in [ADR 0002](../../docs/decisions/0002-use-aws-cognito-for-auth.md).

- **Rule**: All protected routes must use the `authMiddleware`.
- **Reference**: [API/monolith-service/src/middlewares/auth.middleware.ts](../../API/monolith-service/src/middlewares/auth.middleware.ts).
- **Rule**: The backend must verify JWTs using Cognito public keys. Never trust tokens without verification.

## 2. Role-Based Access Control (RBAC)
- **Rule**: Use the `requireRole` middleware to restrict access to specific user roles (TRAVELLER, ACCOMMODATION_OWNER).
- **Reference**: [API/monolith-service/src/middlewares/role.middleware.ts](../../API/monolith-service/src/middlewares/role.middleware.ts).
- **Rule**: Follow the [Enforcement Matrix](../../docs/business-rules/README.md#enforcement-matrix) for all new endpoints.

## 3. PII & Sensitive Data
- **Rule**: Never log sensitive user information (Passwords, Full JWTs, PII) to the console or external logging services.
- **Rule**: Use environment variables for all secrets (AWS Keys, Database URLs).
- **Reference**: [.env.example](../../API/monolith-service/.env.example).

## 4. Input Validation
- **Rule**: Every API request that modifies data (POST, PUT, PATCH) must have a corresponding validation schema (Zod or similar) or typed request object.
- **Reference**: `SearchAccommodationRequest` in [API/monolith-service/src/types/requests.ts](../../API/monolith-service/src/types/requests.ts).

## 5. Security Checklist for New Endpoints
1. [ ] Is the route public or protected? (Use `authMiddleware` if protected).
2. [ ] Does the route require a specific role? (Use `requireRole`).
3. [ ] Are inputs validated using types or schemas?
4. [ ] Does the service layer check ownership if applicable (e.g., can this owner edit THIS property)?
