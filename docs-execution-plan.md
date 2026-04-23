# Execution Plan — Creating a `docs/` Folder for Any Project

Reusable, project-agnostic plan for building a `docs/` knowledge base that serves **both humans and AI agents**. Derived from the pattern in `agile-terms/docs/` and the Gemini-integration setup in `.gemini/`.

Follow phases in order. Each phase has: **Goal**, **Inputs**, **Deliverables**, **Acceptance criteria**, **Agent delegation hint**.

---

## Guiding principles

Before running the plan, internalize these five rules. They shape every phase below.

1. **One source of truth per fact.** `docs/` describes *what the system is*. `.gemini/rules/` (if present) describes *how to write code in it*. They cross-link, never duplicate.
2. **Describe reality, not aspiration.** Wish-items go into ADRs as proposals, not into reference docs.
3. **Short pages, heavy cross-links.** A doc >500 lines does not get read. Split by topic.
4. **Every PR that changes behavior must update the doc it invalidates.** A stale doc is worse than no doc.
5. **Cite code.** Reference concrete files + line numbers (`[FileName.java:67](...)`). Agents verify before applying.

---

## Phase 0 — Prerequisites (1–2 hours)

**Goal**: confirm the project is ready for structured docs.

**Inputs**
- Repository with running code (backend, frontend, or both).
- Read access to issue tracker / past design discussions.
- List of environments (local, dev, test, prod) and how they differ.

**Deliverables**
- Confirmed decision on docs location: `docs/` at repo root (recommended) or `documentation/`.
- Decision on format: Markdown (recommended — renders on GitHub/GitLab, readable as plain text by AI).
- Decision on diagram tool: Mermaid (preferred — lives in Markdown) or ASCII art for simple flows.
- Confirmed owner for each topic area (who reviews PRs that touch that folder).

**Acceptance**
- Folder `docs/` exists as an empty directory with a placeholder `README.md`.
- Repo root `README.md` links to `docs/`.

---

## Phase 1 — Skeleton & index (half day)

**Goal**: stand up the folder layout so subsequent phases have a home.

**Inputs**
- Project tech stack summary.
- Answer to: "is this a monolith, monorepo, or separate service?"

**Deliverables**

Create these directories and README stubs:

```
docs/
├── README.md                    # Index + contribution rules
├── OVERVIEW.md                  # (added in Phase 7) single-page system summary
├── onboarding/
│   └── README.md                # Get a dev running locally in <30 min
├── architecture/
│   └── README.md                # System overview, module boundaries, auth flow
├── api/
│   └── README.md                # REST/gRPC/GraphQL endpoint reference
├── database/
│   └── README.md                # ERD, tables, migration history
├── business-rules/
│   └── README.md                # Rules the application enforces
├── domain-knowledge/
│   └── README.md                # What the product is, who uses it, why
├── terminologies/
│   └── README.md                # Project glossary / seed content (optional)
├── testing/
│   └── README.md                # Test strategy, profiles, coverage target
└── decisions/
    ├── README.md                # ADR index
    └── template.md              # ADR template (copied per decision)
```

**Skip sections that do not apply.** A pure-library project has no `database/`; a CLI tool has no `api/`. Delete, don't leave empty.

**`docs/README.md` template**:

```markdown
# docs/

Single source of truth for humans AND AI.

This directory describes **what the system is, what it does, and why**. For **how to code** in it, see [.gemini/rules/](../.gemini/rules/) (if present).

## Map

| Section | Content |
|---|---|
| [onboarding/](onboarding/) | Local dev setup |
| [architecture/](architecture/) | System overview, module boundaries, auth flow |
| [api/](api/) | Endpoint reference |
| [database/](database/) | Schema, migrations |
| [business-rules/](business-rules/) | Rules the app enforces |
| [domain-knowledge/](domain-knowledge/) | What this product is |
| [testing/](testing/) | Test strategy |
| [decisions/](decisions/) | ADRs |

## Contribution rules

1. Every PR that changes behavior updates the doc it invalidates.
2. Describe reality, not aspiration.
3. Keep pages short. Split by topic, cross-link heavily.
4. When in doubt, write what you wish had been here the day you joined.
```

**Acceptance**
- Directory tree matches above (minus skipped sections).
- `docs/README.md` renders cleanly on the hosting platform (GitHub / GitLab).
- Each subfolder has a stub `README.md` with a 1-line purpose statement.

**Agent hint**: `@general-purpose` can scaffold this mechanically.

---

## Phase 2 — Onboarding (half day)

**Goal**: a new dev runs the project end-to-end in under 30 minutes.

**Inputs**
- `package.json`, `pom.xml`, `Cargo.toml`, `go.mod`, or equivalent.
- Existing `README.md` quick-start (if any).
- Docker / database setup scripts.

**Deliverables**
- `docs/onboarding/README.md` covering:
  - Required tools (language version, IDE recommendations, Docker, DB client).
  - Clone + install commands.
  - Database / service dependencies (copy-paste Docker commands).
  - First-run command.
  - Environment variable checklist (what is required, what is optional, where secrets come from).
  - How to run tests.
  - Common setup errors + fixes.

**Acceptance**
- A teammate not on this project follows the doc and reaches a green build without asking questions.
- Every command is copy-pasteable (no placeholders like `<your-password>`).

**Agent hint**: pair with a fresh teammate or use `@general-purpose` agent in a clean worktree to dry-run.

---

## Phase 3 — Architecture & domain (1–2 days)

**Goal**: capture the system's shape so design discussions start from shared ground.

**Inputs**
- Source tree.
- Existing design notes, Confluence pages, whiteboard photos.

**Deliverables**

### `docs/architecture/README.md`
- Text intro (2–3 paragraphs) — what this system does, who calls it.
- **System diagram** (Mermaid or ASCII) — major components and their communication.
- **Module table** — name, responsibility, tech.
- **Auth flow** — end-to-end sequence (login → token issuance → authenticated request → expiry).
- **Cross-cutting concerns** — logging, error handling, observability, config loading.
- **Environments** — dev / staging / prod, how they differ.

### `docs/domain-knowledge/README.md`
- What the product does in plain language (no code).
- Primary user personas.
- Core domain entities + relationships (ERD in Mermaid or ASCII).
- Why this product exists (the business problem).

### `docs/terminologies/` (if project has domain-specific vocabulary)
- Glossary of domain terms the product uses.
- Canonical reference for how terminology maps to code (e.g., "Sprint" → `SprintEntity`).

**Acceptance**
- A reader unfamiliar with the product can answer: "what does this system do, who uses it, what are the main entities?" after reading these two folders.
- Entity names in the ERD match actual class names in the code (spot-check 5 random entities).

**Agent hint**: `@Explore` agent with "very thorough" thoroughness — have it map the source tree and produce the initial draft. Human review mandatory.

---

## Phase 4 — Reference docs (1–2 days)

**Goal**: canonical reference for API surface + data layer. These are the most-consulted pages and must match reality byte-for-byte.

**Inputs**
- Controller / handler source.
- DTO / request-response definitions.
- Database migration files.
- OpenAPI / Swagger export (if available — use as source, not replacement).

**Deliverables**

### `docs/api/README.md`
For each resource, a table:

```markdown
## Users — `/users`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/users/signup` | public | Create account + send verification email |
| GET  | `/users/{id}` | authenticated | Fetch user profile |

### POST /users/signup

**Request**
\`\`\`json
{ "username": "...", "email": "...", "password": "..." }
\`\`\`

**Response 201**
\`\`\`json
{ "id": 1, "username": "...", "email": "..." }
\`\`\`

**Response 400** — validation failure. See [../business-rules/user-rules.md](...).
**Response 409** — duplicate username or email.
```

Pattern: method table → per-endpoint detail → link to business rules for validation semantics.

### `docs/database/README.md`
- ERD diagram.
- Table-by-table field reference (name, type, constraints, FK targets).
- Index list.
- Migration policy (forward-only, naming).

### `docs/database/migrations.md`
- Table of every migration script: version, filename, purpose, date applied.
- Rows added in order — never deleted even after the script is superseded.

**Acceptance**
- Every public endpoint in the code appears in the API doc.
- Every migration script appears in the migration list.
- Spot-check 5 endpoints: the doc's request/response shape matches the actual DTO source.
- Each endpoint entry links to the relevant business rule page (when validation is non-trivial).

**Agent hint**: `@backend-developer` (if available) — has read access to source and knows framework. Delegate as "generate API reference from source; flag drift between OpenAPI and actual controllers".

---

## Phase 5 — Business rules (1 day)

**Goal**: separate *product* rules (what the app does) from *coding* rules (how the code is written). Business rules outlive codebases.

**Inputs**
- Request DTO validation annotations.
- Service-layer validation code.
- Database constraints.
- Frontend form validation (for cross-reference).

**Deliverables**

### `docs/business-rules/README.md`
- Brief intro: "these are the rules the application enforces".
- **Index** of rule files by topic.
- **Enforcement matrix** — for each rule, show where it is enforced:

```markdown
| Rule | Frontend check | Backend check | DB constraint |
|---|---|---|---|
| Username 2–38 chars, alphanumeric | `SignupValidator.js` | service layer | `UNIQUE NOT NULL` |
| Email regex | Yup schema | `@Email` on DTO | `UNIQUE NOT NULL` |
| ... | ... | ... | ... |
```

### Per-topic files
One file per domain area: `user-rules.md`, `term-rules.md`, `voting-rules.md`, etc. Each file lists:
- The rule in one sentence.
- Where enforced (cite code file + line).
- Failure mode (which HTTP status, which error message constant).
- Edge cases.

**Acceptance**
- Every `@NotNull` / `@Size` / `@Pattern` annotation in request DTOs appears in the enforcement matrix.
- Every `if (invalid) throw ...` in the service layer appears in a rule file.
- No duplication with coding rules (`.gemini/rules/`) — this folder is *what*, not *how*.

**Agent hint**: `@backend-developer` to extract from DTO annotations + service code. Flag any rule that is only frontend-enforced — that's a security smell.

---

## Phase 6 — Testing & ADRs (half day each)

### `docs/testing/README.md`
- Test pyramid for this project (unit / integration / e2e ratios).
- Coverage target (e.g., ≥70% on changed files).
- Test profile setup (e.g., `unit-test` profile with H2; `integration` profile with real DB).
- Naming convention (e.g., `test<Method>_should<Behavior>_when<Condition>`).
- How to run: fast-feedback command vs full CI.
- What NOT to test (getters, generated code, third-party libs).

### `docs/decisions/` — ADRs
- Copy `template.md` (see Phase 1) as `0001-<short-title>.md` for the first decision.
- Backfill ADRs for the **big, settled** decisions the codebase already reflects:
  - Why this framework?
  - Why this auth model?
  - Why this database?
  - Why this state-management library?
  - Why this dependency despite alternatives?

**ADR template**:
```markdown
# NNNN — Short decision title

- **Status**: Proposed | Accepted | Superseded by NNNN
- **Date**: YYYY-MM-DD
- **Deciders**: names or roles

## Context
What is the issue? What constraints narrow the options?

## Decision
We will … (1–3 sentences).

## Options considered
### Option A
- Pros:
- Cons:
### Option B *(chosen)*
- Pros:
- Cons:

## Consequences
- What becomes easier / harder?
- Tech debt / operational cost?
- What triggers revisiting this?

## References
- Links to code, tickets, prior discussions.
```

**Acceptance**
- 3–5 backfilled ADRs that explain the most-contested choices.
- ADR index in `decisions/README.md` lists all ADRs with status.
- Every "why is it like this?" question a new dev asks in their first month has an ADR answer.

**Agent hint**: ADR backfill is a **human** job — requires interviewing long-tenured contributors. Do not delegate to an agent. Agents can draft `testing/README.md` from test config files.

---

## Phase 7 — Overview document (2 hours)

**Goal**: a single scrollable page that hits every topic — the page you send to a new stakeholder, executive, or external auditor.

**Inputs**
- Every page written in Phases 2–6.

**Deliverables**

`docs/OVERVIEW.md` with table of contents, covering:

1. Product overview (2 paragraphs)
2. System architecture (diagram + module table)
3. Backend architecture (layered diagram + package tree)
4. Frontend architecture (routes table + state slices, if applicable)
5. Domain knowledge (ERD + entity field reference)
6. Business rules (per-topic bullets)
7. End-to-end user flows (2–4 key journeys as sequence diagrams)
8. Integration points (external services, persistence, environments)
9. Glossary

**Pattern**: this page summarizes; the topic folders are authoritative. When they disagree, the topic folder wins and `OVERVIEW.md` must be updated in the same PR.

**Acceptance**
- Page renders in <10 seconds on a slow connection.
- Table of contents anchors work.
- Every section links back to its authoritative folder.

**Agent hint**: once Phases 2–6 are done, an agent can compose `OVERVIEW.md` by summarizing each folder. Human must proof-read for tone.

---

## Phase 8 — AI integration (half day, optional but recommended)

**Goal**: make `docs/` first-class context for AI agents.

**Inputs**
- `docs/` completed through Phase 7.
- Team decision on whether to adopt Gemini Code / Copilot / Cursor agent workflows.

**Deliverables**

### `GEMINI.md` (or `.cursorrules`, `AGENTS.md`, equivalent)
At repo root. Short (<100 lines). Content:
- One-sentence project description.
- Pointer to `docs/` as the reference — "read the relevant docs/ page before writing code".
- Pointer to `.gemini/rules/` (if adopted) for coding rules.
- Build / test quick-start commands.
- Module boundaries (if monorepo).

### `.gemini/rules/` (if adopting Gemini Code)
Mirror the pattern from `agile-terms/.gemini/rules/`:
- `backend_coding.md` (or equivalent per language) — framework-specific conventions derived from **actual source patterns**, not generic style guides.
- `frontend_coding.md` — UI conventions.
- `security.md` — OWASP-aligned rules.
- `testing.md` — consolidated test policy.
- `upgrade-policy.md` — frozen baselines + new-code guardrails for planned upgrades.

**Critical**: rules must cite concrete files + line numbers in the repo. Generic style guides do not carry the same weight.

### `.gemini/agents/` (if adopting specialized subagents)
One per module (e.g., `backend-developer.md`, `frontend-developer.md`). YAML frontmatter:
```yaml
---
name: backend-developer
description: <scope + trigger phrases + "do NOT use for X">
tools: Read, Write, Edit, Glob, Grep, Bash, Agent
model: opus
---
```
Body: pre-code checklist ("read rules, fact-check docs"), tech stack table with CVE callouts, bottom-up build order, self-review gate.

### `.gemini/skills/` (if workflows are repeatable)
Per skill: `SKILL.md` with YAML `name` + `description` (triggers), workflow steps, optional `scripts/` for heavy lifting, optional `references/` for templates loaded on demand.

**Acceptance**
- A new Gemini Code session picks up `GEMINI.md` automatically and links to `docs/` on demand.
- An agent asked "add endpoint X" reads the relevant `docs/api/`, `docs/database/`, `docs/business-rules/` before writing code.
- Coding rules cite real files (spot-check 3 rules — each has a `file.ext:line` reference).

---

## Phase 9 — Maintenance loop (ongoing)

**Goal**: docs stay true as code evolves.

**Mechanisms**

1. **PR template checkbox** — "docs/ updated if behavior changed" (add to `.github/pull_request_template.md` or GitLab equivalent).
2. **Quarterly doc review** — calendar item. One person spot-checks 5 random docs against current code; files issues for drift.
3. **ADR on major changes** — any cross-cutting change (framework upgrade, auth rewrite, new external integration) produces an ADR before code lands.
4. **Broken-link check in CI** — lint `docs/` for dead internal links on every PR.
5. **Rule review** — annually, produce a `RULES_REVIEW.md` like `agile-terms/.gemini/rules/RULES_REVIEW.md` — meta-review of coding rules vs current ecosystem best practices; separates "defects" (existing code violates existing rule) from "rule updates" (rule no longer matches reality).

**Anti-pattern to avoid**: don't write docs once and declare victory. Docs rot faster than code. Budget ~5% of engineering time on doc maintenance indefinitely.

---

## Estimated total effort

| Phase | Effort | Parallelizable? |
|---|---|---|
| 0 Prerequisites | 1–2 h | — |
| 1 Skeleton | half day | — |
| 2 Onboarding | half day | with Phase 3 |
| 3 Architecture & domain | 1–2 days | with Phase 2, Phase 4 |
| 4 Reference (API + DB) | 1–2 days | with Phase 3, Phase 5 |
| 5 Business rules | 1 day | with Phase 4 |
| 6 Testing + ADRs | 1 day | with Phase 5 |
| 7 Overview | 2 h | must be last |
| 8 AI integration | half day | after Phase 7 |
| 9 Maintenance | ongoing | — |

**Total**: ~5–7 person-days for a medium-sized project (one backend + one frontend module). Scale linearly with module count.

---

## Reusability checklist

When adapting this plan to a new project, answer these before starting:

- [ ] Does the project have a backend, a frontend, or both? (Skip irrelevant phases.)
- [ ] Is there a database? (Skip `database/` if pure library.)
- [ ] Is there a public API? (Skip `api/` for internal-only libs.)
- [ ] Does the product have domain-specific terminology? (Skip `terminologies/` if generic tooling.)
- [ ] Will AI agents work in this repo? (Skip Phase 8 if not.)
- [ ] Is this a greenfield project or documenting an existing codebase?
  - **Greenfield**: write docs alongside code, one section per PR.
  - **Retrofit**: do Phases 0–7 as a dedicated initiative; reserve two weeks.

---

## Anti-patterns to avoid

| Anti-pattern | Why it fails |
|---|---|
| One giant `README.md` with everything | Unscrollable, no one reads past line 200 |
| Auto-generated-only docs (Swagger export, Javadoc) | No narrative, no "why", no cross-links |
| Aspirational docs ("we plan to support X") in reference pages | Misleads readers; belongs in ADRs as proposal |
| Coding rules mixed with business rules | Confuses audience; coding rules live in `.gemini/rules/` or `CONTRIBUTING.md`, not `docs/` |
| ADRs with no "Consequences" section | Future readers can't judge if the decision is still valid |
| Docs written by one person once | Rots fast; must be owned by whoever touches the area |
| Citing code without line numbers | Drift is invisible; line-numbered citations surface rot on broken-link check |
| Skipping the enforcement matrix in business rules | Reader can't tell if a rule is UX-only or server-enforced |

---

*Template — adapt freely. File this at `<project-root>/docs-execution-plan.md` or in a meta-docs repo.*
