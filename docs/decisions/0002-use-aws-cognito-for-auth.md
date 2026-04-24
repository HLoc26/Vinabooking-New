# ADR 0002: Use AWS Cognito for Auth

## Status
Accepted

## Context
Authentication and identity management are critical but complex components. Building a custom secure authentication system involves managing password hashing, token refreshes, MFA, and social login integrations.

## Decision
We decided to use **AWS Cognito** as our primary Identity Provider (IdP).

## Rationale
1.  **Security**: Offloads sensitive data (passwords) to a battle-tested AWS service.
2.  **Built-in Features**: Supports Email/Password, Social login (Google), and MFA out-of-the-box.
3.  **Scalability**: Handles large numbers of users without additional infrastructure management.
4.  **Integration**: Seamlessly integrates with other AWS services and provides JWT tokens that can be easily verified in the backend monolith.

## Consequences
- **Vendor Lock-in**: The authentication layer is now tied to AWS.
- **Client Implementation**: Requires using AWS SDKs or specific JWT verification libraries in the backend.
- **Latency**: Authentication requests depend on AWS network availability, though this is generally negligible.
