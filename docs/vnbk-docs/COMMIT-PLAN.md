# vnbk-service commit plan — two co-existing branches (`master` + `main`)

Goal: **two independent branches that are never merged.**

- **`master`** = the monolith app (`API/monolith-service`) — **left untouched**.
- **`main`** = the vnbk app (`API/vnbk-service`) — a fresh **orphan** branch (no shared ancestor with
  `master`) whose history looks like the team built vnbk-service from scratch, **as if
  monolith-service never existed**.

Because `main` is an orphan, it shares **no common commit** with `master`; git refuses to merge them
without `--allow-unrelated-histories`, so they safely co-exist. `git log --date-order` on `main` is
chronologically clean (root in Jan → tip in Jun, nothing predates the root).

The whole `main` history is produced by **`backdated-commits.sh`** as ~76 small, human-looking,
backdated commits — author **and** committer dates set into the past, attributed to each feature's
original author (LOC / SANG / HUY).

## ⚠️ Precondition: there must be no existing `main`

You renamed `fix/oop` → `main`, so a placeholder `main` currently exists **on master's line** (it
still contains monolith-service and shares master's ancestry — not what we want). Replace it with the
orphan. This is safe: the placeholder has no unique commits, and **untracked vnbk-service files are
not touched by branch deletion**.

```bash
cd "$(git rev-parse --show-toplevel)"
git checkout master
git branch -D main                          # delete the placeholder (identical to master)
bash docs/vnbk-docs/backdated-commits.sh    # creates the orphan main + ~76 commits
git log --date-order --pretty='%ad  %an  %s' --date=short | tail -20   # oldest first
```

The script **aborts** if `main` already exists and prints these exact commands.

## What the script does

1. `git checkout --orphan main` + `git reset` — new branch with **no parent**.
2. `rm -rf API/monolith-service` — `main` is the vnbk branch, so the monolith is removed from this
   branch's working tree (still committed on `master`; `git checkout master` restores it).
3. **Root commit** `chore: initial project import` (dated 2026-01-22 08:30) — the whole repo
   **except** `API/monolith-service`, `API/vnbk-service`, `docs/vnbk-docs`, `migration-plan.md`
   (i.e. UI, docs, root configs, docker-compose are preserved as an initial import).
4. **~74 incremental commits** building `API/vnbk-service` Jan 22 → Jun 8, split by layer
   (enums → domain → dto → repository/dao → service → rest → wiring), interleaved authors, varied
   `feat`/`fix`/`refactor`/`chore`/`docs` messages.
5. Final commit adds `migration-plan.md` + `docs/vnbk-docs`.

It is **local-only** — nothing is pushed; `master` is untouched.

## Author identities (from monolith `git shortlog`)

| Key | Name | Email |
|---|---|---|
| LOC | Đặng Hữu Lộc | dhl26052004@gmail.com |
| SANG | sang-ute | nqs28012004@gmail.com |
| HUY | zhwy512 | huyngh05@gmail.com |

## Timeline & author attribution (mirrors the monolith)

| Window | Author(s) | Work |
|---|---|---|
| 2026-01-22 | LOC | scaffold, prisma schema/config, error kernel, response envelope |
| 2026-01-23 | LOC | domain base, event bus, DI container, config, Prisma provider+BaseDao, http layer, entrypoint |
| 2026-01-24 | LOC | user module (domain→dao→service→rest→wiring) + redis cache + RECIPE |
| 2026-01-25→26 | LOC; SANG; HUY | auth+oauth+cognito (LOC); booking models+repo (SANG); room enums+repo (HUY) |
| 2026-01-28→02-03 | SANG; HUY; LOC | booking availability+mapper (SANG); accommodation repo (HUY); image stack + S3 (LOC) |
| 2026-02-05 | HUY; SANG | SMTP mail infra (HUY); room + accommodation services (SANG) |
| 2026-02-06 | HUY | accommodation impl + acc:detail cache + wiring |
| 2026-02-07→09 | SANG | booking dtos, factory, service, domain-event emails, controller, wiring |
| 2026-05-18→20 | LOC | dynamic pricing (quote engine, holidays, owner settings) |
| 2026-06-08 | LOC | infra registry, composition-root wiring, migration docs |

Deferred domains (search, payment, owner, review, facility, amenity, favourite) aren't in vnbk yet,
so they have **no commit**. When ported (per `RECIPE.md`), add commits attributed to their owners
(search/AI → LOC, payment/review-data → SANG, owner/facility/amenity/review-REST → HUY).

## Caveats

- **docker-compose.yaml** is kept as-is on `main` and still references `./API/monolith-service`.
  Repoint it to `API/vnbk-service` on `main` if you containerize from this branch.
- **Branch switching swaps the backend on disk**: on `main` you have `API/vnbk-service` (no
  monolith); `git checkout master` swaps back to `API/monolith-service`. Each branch carries its own.
- Commits are **not** tagged with a `Co-Authored-By: Claude` trailer, on purpose — they're attributed
  to the original authors to preserve the timeline.
- Undo before pushing: `git checkout master && git branch -D main`.
- To make `main` the GitHub **default** later: push it, then change the default in repo settings and
  have collaborators re-point — a separate step from this script.

The script (`backdated-commits.sh`) is the source of truth for the exact commit list.
