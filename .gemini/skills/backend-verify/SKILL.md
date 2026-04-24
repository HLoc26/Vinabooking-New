---
name: backend-verify
description: Verify the backend monolith by running lint and build scripts. Use when the user asks to "build the backend", "verify the API", or "check backend lint".
---

# backend-verify

This skill ensures the backend codebase is compliant with linting rules and compiles correctly.

## Guidelines

- Refer to [Testing & Quality Rules](../../rules/testing.md) for quality standards.

## Workflow

1.  Navigate to `API/monolith-service/`.
2.  Run `npm run lint` to check for code style issues.
3.  Run `npm run build` to verify TypeScript compilation.
4.  If any step fails:
    - Capture the error output.
    - Propose fixes for the reported issues.
    - Re-run the verification once fixed.
5.  Report final status (Success/Failure).
