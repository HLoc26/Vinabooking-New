# Execution Plan — Creating Custom Skills for Vinabooking

This plan outlines the creation of specialized Gemini CLI skills to automate repetitive development, verification, and review workflows for the Vinabooking project.

---

## Skill 1: `backend-add-resource`

**Trigger**: "add an endpoint", "create a REST API", "add a controller", "scaffold a new resource", "implement the backend for X".

**Context**:
- Read `GEMINI.md`, `.gemini/rules/backend_coding.md`, and `docs/api/README.md`.
- Understand the **Controller-Service-Repository** pattern and the `registry.ts` dependency injection.

**Workflow**:
1. Gather resource name, fields, and operations (CRUD).
2. Gather auth policy (Public, Authenticated, or Owner-only).
3. Create files in order: Repository -> Service -> Controller -> Router.
4. Update `registry.ts` to register new instances.
5. Update `src/routes/index.routes.ts` (or equivalent) to mount the new router.

---

## Skill 2: `backend-verify`

**Trigger**: "build the backend", "verify the backend", "check backend lint", "does the API compile?".

**Context**:
- Read `API/monolith-service/package.json` for script definitions.

**Workflow**:
1. Run `npm run lint` in `API/monolith-service/`.
2. Run `npm run build` in `API/monolith-service/`.
3. Report status. Stop on first failure with the exact error message.

---

## Skill 3: `frontend-add-feature`

**Trigger**: "add a component", "create a page", "build a UI for", "add a form", "add a route", "wire up this API in the frontend".

**Context**:
- Read `GEMINI.md`, `.gemini/rules/frontend_coding.md`, and `docs/architecture/README.md`.
- Tech stack: React 19, MUI, TanStack Query, Redux Toolkit.

**Workflow**:
1. Gather feature name and purpose.
2. Identify if it belongs in an existing feature in `src/features/` or needs a new one.
3. Generate components using MUI.
4. Implement data fetching hooks using TanStack Query and `apiClient`.
5. Update `src/routes/` to expose the new page.

---

## Skill 4: `frontend-verify`

**Trigger**: "build the frontend", "verify the frontend", "check UI lint", "does the frontend build?".

**Context**:
- Read `UI/package.json` for script definitions.

**Workflow**:
1. Run `npm run lint` in `UI/`.
2. Run `npm run format:check` in `UI/`.
3. Run `npm run build` in `UI/`.
4. Report status.

---

## Skill 5: `code-review`

**Trigger**: "review this code", "code review", "check my changes", "does this look good?", "review [filename]".

**Context**:
- Read all rules in `.gemini/rules/` and `GEMINI.md`.

**Workflow**:
1. Identify which files changed (using `git diff`).
2. Load relevant rule files based on the file paths (e.g., `backend_coding.md` for `API/` files).
3. Check for:
   - Layer violations (e.g., DB calls in controllers).
   - Security omissions (missing `authMiddleware` or `requireRole`).
   - Styling inconsistencies (MUI usage).
   - Missing types or poor naming.
4. Produce a structured report with `file:line` references and suggested fixes.

---

## Skill 6: `prepare-pr`

**Trigger**: "create a PR", "prepare for commit", "raise a pull request", "wrap up my work".

**Context**:
- Read root `README.md` (GitHub context).

**Workflow**:
1. Run `git status` and `git diff` to summarize changes.
2. Propose a clear commit message following project style.
3. Suggest a PR description including:
   - **Summary**: What changed.
   - **Technical Details**: How it was implemented.
   - **Verification**: Commands run to verify (triggering verify skills).
4. Prompt user to commit or stage changes.

---

## Next Steps

1. Activate the `skill-creator` skill.
2. Implement each skill defined above one by one.
3. Verify each skill with a dummy task.
