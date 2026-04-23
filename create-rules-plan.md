# Execution Plan — Creating a `.gemini/rules/` Knowledge Base

This plan describes how to build a robust set of AI-native coding rules for the Vinabooking project. These rules ensure that Gemini CLI (and other agents) produce code that is consistent, secure, and idiomatically correct for this specific Node.js/React monolith.

Follow phases in order. Each phase has: **Goal**, **Inputs**, **Deliverables**, **Acceptance criteria**, and **Agent delegation hint**.

---

## Guiding Principles

1. **Cite Reality.** Every rule must reference at least one concrete file and line number in the current codebase (`[File.ts:12](...)`).
2. **One Source of Truth.** `docs/` describes *what* the system is; `.gemini/rules/` describes *how* to write code in it.
3. **Atomic Rules.** One file per topic (e.g., `backend_coding.md`, `security.md`). Avoid a single "monster" rules file.
4. **Context-Aware.** Distinguish between Traveler-facing UI and Owner-facing UI, and between Controller, Service, and Repository patterns.
5. **Auto-Verifiable.** Rules should be written such that an agent can self-correct by running existing linters or build commands.

---

## Phase 1 — Discovery & Baseline (2–4 hours)

**Goal**: Map the actual patterns currently used in the codebase to ensure rules reflect reality, not theory.

**Inputs**
- Backend: `API/monolith-service/src/`
- Frontend: `UI/src/`
- Infrastructure: `prisma/schema.prisma`, `docker-compose.yaml`

**Deliverables**
- A summary of "Pattern Winners" (e.g., "We use `ResponseHelper` in all controllers", "We use `RTK Query` for X, `TanStack Query` for Y").
- Identification of "Legacy Drift" (old patterns that should NOT be used in new rules).

**Acceptance**
- List of core technologies confirmed (React 19, Express, Prisma, MUI, Redux Toolkit).
- Entry point for both modules identified.

**Agent hint**: `@codebase_investigator` can map the patterns by grepping for common imports and structural markers.

---

## Phase 2 — Core Backend Rules (1 day)

**Goal**: Establish the "Golden Path" for backend development.

**Inputs**
- `API/monolith-service/src/controllers/`
- `API/monolith-service/src/services/`
- `API/monolith-service/src/repositories/`
- `API/monolith-service/src/registry.ts`

**Deliverables**
- `.gemini/rules/backend_coding.md`:
  - Controller-Service-Repository layering rules.
  - Dependency Injection patterns using the `registry.ts`.
  - Standardized error handling using `AppError` and specialized subclasses.
  - Prisma usage guidelines (using generated client, avoiding raw queries).

**Acceptance**
- Every rule cites a "correct" implementation in the current `API/` folder.
- Rules explicitly forbid common anti-patterns (e.g., database logic in controllers).

**Agent hint**: `@generalist` can draft these by analyzing the best-implemented module (e.g., `booking` or `accommodation`).

---

## Phase 3 — Core Frontend Rules (1 day)

**Goal**: Establish the "Golden Path" for frontend development.

**Inputs**
- `UI/src/features/`
- `UI/src/theme/`
- `UI/src/services/apiClient.ts`

**Deliverables**
- `.gemini/rules/frontend_coding.md`:
  - Feature-based folder structure requirements.
  - MUI styling conventions (usage of `sx`, `ThemeProvider`, custom variants).
  - State management strategy (Redux for UI, TanStack Query for Server State).
  - API communication via `apiClient`.

**Acceptance**
- Rule distinguishes between Traveler (Default) and Owner (Dark) themes.
- Feature structure matches the `src/features/[feature]/{components,hooks,pages,types}` pattern.

---

## Phase 4 — Security & Identity (half day)

**Goal**: Codify the security protocols for Auth and RBAC.

**Inputs**
- `API/monolith-service/src/middlewares/auth.middleware.ts`
- `API/monolith-service/src/middlewares/role.middleware.ts`
- AWS Cognito configuration details.

**Deliverables**
- `.gemini/rules/security.md`:
  - Mandatory use of `authMiddleware` for protected routes.
  - Role-based access control (RBAC) enforcement using `requireRole`.
  - Guidelines for handling PII and sensitive tokens (Cognito integration).

**Acceptance**
- Rules include a checklist for "Adding a new protected endpoint".

---

## Phase 5 — Testing & Quality (half day)

**Goal**: Define how to verify code changes.

**Inputs**
- `package.json` scripts.
- Existing (or planned) test directories.

**Deliverables**
- `.gemini/rules/testing.md`:
  - Naming conventions for tests.
  - Mocking strategies for AWS services (S3, Cognito).
  - Pre-commit check requirements (Linting, Formatting, Type-checking).

**Acceptance**
- Rules cite the exact commands to run for verification (`npm run lint`, `tsc`, etc.).

---

## Phase 6 — Integration & Activation (2 hours)

**Goal**: Ensure Gemini CLI consumes these rules automatically.

**Inputs**
- `GEMINI.md` at repo root.

**Deliverables**
- Updated `GEMINI.md` with pointers to `.gemini/rules/`.
- A "Rule Review" skill or prompt to verify new code against these rules.

**Acceptance**
- A new Gemini session correctly identifies the rules folder and applies them to a small task.

---

## Maintenance Loop

1. **Rule Drift Check**: Monthly check to ensure cited code still exists at the cited lines.
2. **Correction Cycle**: When an agent makes a mistake that violates a "hidden" convention, add that convention to the rules immediately.
3. **Upgrade Policy**: When a core library is upgraded (e.g., React 19 to 20), update the rules folder first.
