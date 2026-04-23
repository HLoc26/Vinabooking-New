# Testing & Quality Rules

These rules maintain the long-term stability and quality of the Vinabooking project as outlined in [Testing Strategy](../../docs/testing/README.md).

## 1. Automated Testing Strategy
- **Rule**: Prioritize testing business logic in the Service layer (Backend) and custom Hooks (Frontend).
- **Rule**: Use descriptive test names following the pattern: `test[Method]_should[ExpectedBehavior]_when[Condition]`.

## 2. Code Quality & Linting
- **Rule**: Every PR must pass `npm run lint` and `npm run build` for both API and UI modules.
- **Rule**: Adhere to the `eslint` configuration defined in each module's root.
- **Reference**: [UI/eslint.config.js](../../UI/eslint.config.js).

## 3. Formatting
- **Rule**: Use Prettier for consistent code formatting.
- **Reference**: [.prettierrc](../../.prettierrc).

## 4. TypeScript Usage
- **Rule**: Avoid `any` at all costs. Use `unknown` or define proper interfaces.
- **Rule**: Use `type` for simple data structures and `interface` for classes or complex object shapes that might be extended.

## 5. Pre-commit Requirements
We use `husky` and `lint-staged` to enforce quality before code is committed.
- **Rule**: Never bypass the pre-commit hooks unless explicitly instructed for emergency fixes.
- **Reference**: [.husky/pre-commit](../../.husky/pre-commit).
