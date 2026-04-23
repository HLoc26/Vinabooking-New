---
name: frontend-add-feature
description: Scaffold a new frontend feature in UI/src/features/ including components, hooks, services, and routing. Use when the user wants to "add a component", "create a page", or "wire up this API in the frontend".
---

# frontend-add-feature

This skill automates the creation of a new frontend feature following the project's **Feature-based** architecture.

## Guidelines

- **Architecture**: Always follow the patterns in [Frontend Coding Rules](../../rules/frontend_coding.md) and [System Architecture](../../../docs/architecture/README.md).
- **Tech Stack**: React 19, MUI, TanStack Query, Redux Toolkit.
- **Styling**: Adhere to [UI/src/theme/theme.ts](../../../UI/src/theme/theme.ts).

## Workflow

1.  **Identify Feature**: Determine if the task belongs to an existing feature in `UI/src/features/` or requires a new one.
2.  **Scaffold Feature Directory** (if new): Create `components/`, `hooks/`, `pages/`, `types/`, and `[feature]Api.ts`.
3.  **Implement API Service**: Define API calls in `[feature]Api.ts` using the shared `apiClient`.
4.  **Implement Hooks**: Create custom hooks using `TanStack Query` for data fetching and mutations.
5.  **Create Components/Pages**: Build UI components using MUI components and the feature's hooks.
6.  **Register Routing**:
    - Update the relevant route configuration (e.g., `src/routes/`) to expose the new page.
7.  **State Management**: If global UI state is needed, create a Redux slice in the feature directory.
