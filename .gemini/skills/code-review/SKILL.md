---
name: code-review
description: Perform a comprehensive code review of changes based on the project's coding, security, and architectural rules. Use when the user says "review this code", "check my changes", or "does this look good?".
---

# code-review

This skill provides a structured review of code changes to ensure consistency and security.

## Guidelines

- **Rules**: Evaluate changes against all files in [.gemini/rules/](../../rules/).
- **Context**: Consider the [System Architecture](../../../docs/architecture/README.md).

## Workflow

1.  **Identify Changes**: Use `git status` and `git diff` to identify modified files.
2.  **Apply Rules**:
    - For `API/` files: Check [Backend Coding Rules](../../rules/backend_coding.md).
    - For `UI/` files: Check [Frontend Coding Rules](../../rules/frontend_coding.md).
    - For all: Check [Security & Authentication Rules](../../rules/security.md) and [Testing & Quality Rules](../../rules/testing.md).
3.  **Check for Common Issues**:
    - Architectural layer violations.
    - Missing or incorrect types.
    - Security vulnerabilities (missing middleware, exposed secrets).
    - Styling inconsistencies.
4.  **Produce Report**: Provide a structured summary with:
    - **Strengths**: What was done well.
    - **Issues**: Bullet points with `file:line` references and suggested fixes.
    - **Conclusion**: Overall recommendation (Approve/Request Changes).
