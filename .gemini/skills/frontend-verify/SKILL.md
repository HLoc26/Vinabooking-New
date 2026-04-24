---
name: frontend-verify
description: Verify the frontend application by running lint, format check, and build scripts. Use when the user asks to "build the frontend", "check UI lint", or "verify the UI".
---

# frontend-verify

This skill ensures the frontend codebase is compliant with quality standards and builds successfully.

## Guidelines

- Refer to [Testing & Quality Rules](../../rules/testing.md) for quality standards.

## Workflow

1.  Navigate to `UI/`.
2.  Run `npm run lint` to check for ESLint errors.
3.  Run `npm run format:check` to ensure Prettier compliance.
4.  Run `npm run build` to verify the production build and TypeScript types.
5.  If any step fails:
    - Capture the error output.
    - Propose fixes for the reported issues.
    - Re-run the verification once fixed.
6.  Report final status (Success/Failure).
