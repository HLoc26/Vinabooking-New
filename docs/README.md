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
