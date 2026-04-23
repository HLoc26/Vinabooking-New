# Vinabooking UI Context

This file provides specialized context for the Vinabooking frontend application.

## Overview
The Vinabooking UI is a modern React application built with TypeScript and Vite. It serves both Traveler and Owner roles through a unified codebase with conditional layouts and themes.

## Tech Stack
- **React 19**: UI Framework.
- **Vite**: Build tool and dev server.
- **TypeScript**: Static typing.
- **Material UI (MUI)**: Component library and styling.
- **Redux Toolkit**: Global state management (Auth, Search, Booking).
- **Redux Persist**: Persists state across sessions with custom `dateTransform`.
- **TanStack Query (v5)**: Server state management, caching, and data fetching.
- **React Router 7**: Client-side routing.
- **Axios**: HTTP client with refresh token interceptors.

## Key Development Patterns

### 1. Feature-Based Architecture
Code is organized by feature in `src/features/`. Each feature typically contains:
- `components/`: UI components specific to the feature.
- `hooks/`: Custom hooks, especially TanStack Query wrappers.
- `pages/`: Page-level components.
- `types/`: TypeScript definitions.
- `services/` or `*Api.ts`: API call definitions.

### 2. State Management Strategy
- **Global UI State**: Managed via Redux (e.g., current user, booking drafts).
- **Server Data**: Managed via TanStack Query. Avoid duplicating server data in Redux.
- **Persistence**: Auth and Booking data are persisted in `localStorage`. Note the `dateTransform` in `src/app/store.ts` for handling Date objects.

### 3. Styling and Themes
- Uses MUI `ThemeProvider`.
- **Traveler Theme**: Default (`src/theme/theme.ts`).
- **Owner Theme**: Dark mode (`src/theme/darkTheme.ts`), activated on `/owner/*` routes.

### 4. API Communication
- Use the shared `apiClient` in `src/services/apiClient.ts`.
- It handles `Authorization` headers and 401 token refresh automatically.
- Pass arrays in params using `qs` array format `repeat`.

## Commands
- `npm run dev`: Start development server (default: http://localhost:5173).
- `npm run build`: Type-check and build for production.
- `npm run lint`: Run ESLint checks.
- `npm run format`: Format code with Prettier.

## Routing Structure
Defined in `src/routes/index.tsx`.
- `/`: Home / Traveler landing.
- `/search`: Search results.
- `/accommodation/:id`: Detail page.
- `/owner/*`: Owner dashboard and property management.
- `/auth/*`: Login, Register, Forgot Password.
- `/user/*`: Profile and traveler settings.
