# Frontend Coding Rules

These rules define the "Golden Path" for frontend development in the Vinabooking React application.

## 1. Feature-Based Architecture
The project is organized by domains in `src/features/`.

- **Rule**: Every feature should follow the standard folder structure:
  - `components/`: UI components specific to the feature.
  - `hooks/`: TanStack Query hooks and feature-specific logic.
  - `pages/`: Page-level components.
  - `types/`: TypeScript definitions.
  - `[feature]Api.ts`: API service calls.
- **Reference**: `src/features/accommodation/` in [UI/src/features/accommodation](../../UI/src/features/accommodation).

## 2. State Management Strategy
Distinguish clearly between Server State and Global UI State as described in [Frontend Architecture](../../docs/architecture/README.md).

- **Server State (TanStack Query)**: Use for all data fetched from the API.
  - **Rule**: Create custom hooks for queries and mutations.
  - **Reference**: `useAccommodation` hooks in [UI/src/features/accommodation/hooks](../../UI/src/features/accommodation/hooks).
- **Global UI State (Redux Toolkit)**: Use for UI-specific global state (e.g., Modals, Search filters, Auth).
  - **Rule**: Keep the Redux store lean. Do not mirror server state in Redux.
  - **Reference**: `authSlice` in [UI/src/features/auth](../../UI/src/features/auth).

## 3. Styling with Material UI (MUI)
We use MUI and Emotion for all styling.

- **Rule**: Use the `sx` prop for small, one-off styling overrides.
- **Rule**: Use the `styled` utility for complex, reusable styled components.
- **Rule**: Adhere to the theme constants (spacing, colors, typography).
- **Reference**: [UI/src/theme/theme.ts](../../UI/src/theme/theme.ts).

## 4. API Communication
- **Rule**: Always use the shared `apiClient` for requests to ensure `Authorization` headers are handled.
- **Reference**: [UI/src/services/apiClient.ts](../../UI/src/services/apiClient.ts).
- **Rule**: Use `qs` for consistent query string serialization.

## 5. Forms & Validation
- **Rule**: Use `React Hook Form` and `Zod` (or `Yup`) for form management and validation.
- **Reference**: [UI/src/features/auth/components/LoginForm.tsx](../../UI/src/features/auth/components/LoginForm.tsx).
