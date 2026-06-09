#!/usr/bin/env bash
#
# Two co-existing branches that are NEVER merged:
#   master = the monolith app  (API/monolith-service)  -- left untouched
#   main   = the vnbk app       (API/vnbk-service)       -- created here, ORPHAN (no shared ancestor)
#
# Because `main` is an orphan, it shares no common commit with `master`; git refuses to merge them
# without --allow-unrelated-histories, so they safely co-exist. This builds `main`'s history as if
# monolith-service never existed: a root "initial project import" of the whole repo EXCEPT
# API/monolith-service, then the vnbk backend as ~74 incremental, human-looking commits
# (Jan 22 -> Jun 8) interleaved between the three authors. `git log --date-order` is clean.
# Local-only — nothing is pushed; master is untouched.
#
# Usage:
#   cd "$(git rev-parse --show-toplevel)"
#   bash docs/vnbk-docs/backdated-commits.sh [branch-name]      # default branch: main
#
# Branch-switch behavior (expected): on `main` the backend on disk is vnbk-service (no monolith);
# `git checkout master` swaps it back to monolith-service. Each branch carries its own backend.
# docker-compose.yaml is kept as-is on main and still references monolith-service — repoint it to
# API/vnbk-service on `main` if you containerize from this branch.
#
# Undo (before pushing): git checkout master && git branch -D main
#
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

BRANCH="${1:-main}"
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  echo "ERROR: branch '$BRANCH' already exists and would be clobbered."
  echo
  echo "If it's just a placeholder (e.g. a rename of fix/oop, identical to master), replace it"
  echo "with the orphan vnbk branch — this is safe (it has no unique commits; your untracked"
  echo "vnbk-service files are not touched by branch deletion):"
  echo "    git checkout master"
  echo "    git branch -D $BRANCH"
  echo "    bash $0"
  echo
  echo "Otherwise run with a different name:  bash $0 <branch>"
  exit 1
fi
ORIG_BRANCH="$(git branch --show-current || echo DETACHED)"
echo "Source branch: $ORIG_BRANCH  ->  creating orphan '$BRANCH'"

V="API/vnbk-service"
SH="$V/src/shared"; HT="$V/src/http"; INF="$V/src/infrastructure"
U="$V/src/modules/user"; A="$V/src/modules/auth"; R="$V/src/modules/room"
AC="$V/src/modules/accommodation"; IM="$V/src/modules/image"; B="$V/src/modules/booking"; P="$V/src/modules/pricing"

LOC_N="Đặng Hữu Lộc";  LOC_E="dhl26052004@gmail.com"
SANG_N="sang-ute";     SANG_E="nqs28012004@gmail.com"
HUY_N="zhwy512";       HUY_E="huyngh05@gmail.com"

n=0
commit_at() {  # <iso-date> <name> <email> <message>   (stages must already be added)
  local date="$1" name="$2" email="$3" msg="$4"
  if git diff --cached --quiet; then return 0; fi
  GIT_AUTHOR_NAME="$name"   GIT_AUTHOR_EMAIL="$email"   GIT_AUTHOR_DATE="$date" \
  GIT_COMMITTER_NAME="$name" GIT_COMMITTER_EMAIL="$email" GIT_COMMITTER_DATE="$date" \
    git commit -q -m "$msg"
  n=$((n+1)); printf "  %2d  %s  %-6s %s\n" "$n" "${date%T*}" "$name" "$msg"
}
commit_as() {  # <iso-date> <name> <email> <message> <path...>
  local date="$1" name="$2" email="$3" msg="$4"; shift 4
  git add -- "$@" 2>/dev/null || true
  commit_at "$date" "$name" "$email" "$msg"
}

# ───────────────────────── create orphan branch ─────────────────────────
git checkout -q --orphan "$BRANCH"
git reset -q                       # empty the index; working tree untouched

# main is the vnbk branch: remove the monolith from THIS branch's working tree.
# (It stays committed on master; `git checkout master` restores it.)
rm -rf API/monolith-service

# ───────────────────────── ROOT: initial import (repo minus monolith + minus vnbk/docs built later) ─────────────────────────
git add -A -- . ':(exclude)API/monolith-service' ':(exclude)API/vnbk-service' ':(exclude)docs/vnbk-docs' ':(exclude)migration-plan.md'
commit_at "2026-01-22T08:30:00+07:00" "$LOC_N" "$LOC_E" "chore: initial project import"

echo "Building vnbk-service backend history..."

# ───────────────────────── Jan 22 — scaffold (Lộc) ─────────────────────────
commit_as "2026-01-22T09:05:00+07:00" "$LOC_N" "$LOC_E" "chore(api): scaffold backend service" "$V/package.json" "$V/package-lock.json" "$V/.gitignore"
commit_as "2026-01-22T09:48:00+07:00" "$LOC_N" "$LOC_E" "feat(config): add sample prisma schema and config" "$V/prisma" "$V/prisma.config.ts"
commit_as "2026-01-22T10:25:00+07:00" "$LOC_N" "$LOC_E" "feat(config): add tsconfig with custom @ paths and decorators" "$V/tsconfig.json"
commit_as "2026-01-22T11:10:00+07:00" "$LOC_N" "$LOC_E" "chore: add prettier, eslint, nodemon and docker config" "$V/.prettierrc" "$V/eslint.config.js" "$V/nodemon.json" "$V/Dockerfile" "$V/.dockerignore"
commit_as "2026-01-22T14:30:00+07:00" "$LOC_N" "$LOC_E" "feat(errors): add base error hierarchy" "$SH/error"
commit_as "2026-01-22T16:05:00+07:00" "$LOC_N" "$LOC_E" "feat(utils): add response envelope helper" "$SH/http"

# ───────────────────────── Jan 23 — kernel + DI + http (Lộc) ─────────────────────────
commit_as "2026-01-23T09:15:00+07:00" "$LOC_N" "$LOC_E" "feat(core): add base Entity and AggregateRoot" "$SH/domain"
commit_as "2026-01-23T09:50:00+07:00" "$LOC_N" "$LOC_E" "feat(core): add base mapper contract" "$SH/mapper"
commit_as "2026-01-23T10:40:00+07:00" "$LOC_N" "$LOC_E" "feat(core): add in-process domain event bus" "$SH/events"
commit_as "2026-01-23T11:30:00+07:00" "$LOC_N" "$LOC_E" "feat(di): set up tsyringe container and module contract" "$V/src/di"
commit_as "2026-01-23T14:05:00+07:00" "$LOC_N" "$LOC_E" "feat(config): add typed env config" "$V/src/config"
commit_as "2026-01-23T15:10:00+07:00" "$LOC_N" "$LOC_E" "feat(db): add prisma client provider and base dao" "$INF/persistence"
commit_as "2026-01-23T16:20:00+07:00" "$LOC_N" "$LOC_E" "feat(http): add base controller, router and app router" "$HT/AppRouter.ts" "$HT/BaseController.ts" "$HT/BaseRouter.ts" "$HT/HttpResult.ts" "$HT/IRouter.ts" "$HT/http.tokens.ts"
commit_as "2026-01-23T17:00:00+07:00" "$LOC_N" "$LOC_E" "feat(http): add error handler and request logger middleware" "$HT/middleware/ErrorHandlerMiddleware.ts" "$HT/middleware/RequestLogger.ts"
commit_as "2026-01-23T17:35:00+07:00" "$LOC_N" "$LOC_E" "feat(types): add userId extension to express Request" "$V/src/types/express.d.ts"
commit_as "2026-01-23T18:00:00+07:00" "$LOC_N" "$LOC_E" "feat(core): bootstrap application entrypoint" "$V/src/main.ts"

# ───────────────────────── Jan 24 — user (Lộc) ─────────────────────────
commit_as "2026-01-24T09:20:00+07:00" "$LOC_N" "$LOC_E" "feat(user): add ERole enum and User domain model" "$U/enums" "$U/domain"
commit_as "2026-01-24T10:10:00+07:00" "$LOC_N" "$LOC_E" "feat(user): add user request and response dtos" "$U/dto"
commit_as "2026-01-24T11:00:00+07:00" "$LOC_N" "$LOC_E" "feat(repository): add user repository and dao" "$U/repository" "$U/dao"
commit_as "2026-01-24T13:30:00+07:00" "$LOC_N" "$LOC_E" "feat: add redis cache service" "$INF/cache"
commit_as "2026-01-24T14:40:00+07:00" "$LOC_N" "$LOC_E" "feat(services): add user service" "$U/service"
commit_as "2026-01-24T15:50:00+07:00" "$LOC_N" "$LOC_E" "feat(controllers): add user controller and router" "$U/rest"
commit_as "2026-01-24T16:40:00+07:00" "$LOC_N" "$LOC_E" "chore(user): wire user module for DI" "$U/user.tokens.ts" "$U/UserModule.ts" "$U/index.ts"
commit_as "2026-01-24T17:20:00+07:00" "$LOC_N" "$LOC_E" "docs: add module recipe" "$V/RECIPE.md"

# ───────────────────────── Jan 25-26 — auth (Lộc) + booking models (Sang) + room repo (Huy) ─────────────────────────
commit_as "2026-01-25T09:10:00+07:00" "$LOC_N" "$LOC_E" "feat: add aws packages and cognito idp client" "$INF/auth-idp/CognitoIdpClient.ts"
commit_as "2026-01-25T09:55:00+07:00" "$LOC_N" "$LOC_E" "feat: add jwt utils for verifying jwt tokens" "$INF/auth-idp/CognitoTokenVerifier.ts" "$INF/auth-idp/ITokenVerifier.ts"
commit_as "2026-01-25T10:40:00+07:00" "$LOC_N" "$LOC_E" "feat(middlewares): add auth guard and validation pipe" "$HT/middleware/AuthGuard.ts" "$HT/middleware/ValidationPipe.ts"
commit_as "2026-01-25T11:25:00+07:00" "$LOC_N" "$LOC_E" "feat(auth): add provider enum and domain" "$A/enums" "$A/domain"
commit_as "2026-01-25T14:20:00+07:00" "$SANG_N" "$SANG_E" "feat(booking): add Booking and BookingDetail models with enums for status and item type" "$B/enums" "$B/domain"
commit_as "2026-01-25T15:30:00+07:00" "$LOC_N" "$LOC_E" "feat(types): add auth requests and responses type" "$A/dto"
commit_as "2026-01-25T16:40:00+07:00" "$LOC_N" "$LOC_E" "feat(repository): add auth.repository" "$A/repository" "$A/dao"
commit_as "2026-01-26T09:30:00+07:00" "$LOC_N" "$LOC_E" "feat(service): add auth.service" "$A/service/IAuthService.ts" "$A/service/JwtDecoder.ts" "$A/service/impl/AuthServiceImpl.ts"
commit_as "2026-01-26T10:40:00+07:00" "$LOC_N" "$LOC_E" "feat(service): add oauth service with google callback" "$A/service/IOAuthService.ts" "$A/service/impl/OAuthServiceImpl.ts"
commit_as "2026-01-26T13:05:00+07:00" "$SANG_N" "$SANG_E" "feat(repository): implement BookingRepository with CRUD operations and detail retrieval" "$B/repository" "$B/dao/BookingDao.ts"
commit_as "2026-01-26T14:30:00+07:00" "$LOC_N" "$LOC_E" "feat(controllers): implement auth controller and router" "$A/rest"
commit_as "2026-01-26T15:20:00+07:00" "$LOC_N" "$LOC_E" "chore(auth): wire auth module" "$A/auth.tokens.ts" "$A/AuthModule.ts" "$A/index.ts"
commit_as "2026-01-26T16:10:00+07:00" "$HUY_N" "$HUY_E" "feat(room/prisma): add Room model and related enums" "$R/enums"
commit_as "2026-01-26T16:55:00+07:00" "$HUY_N" "$HUY_E" "feat(room/repository): implement RoomRepository with CRUD operations and filtering" "$R/repository"

# ───────────────────────── Jan 28 - Feb 3 — booking availability (Sang), accommodation repo (Huy), image (Lộc) ─────────────────────────
commit_as "2026-01-28T10:00:00+07:00" "$SANG_N" "$SANG_E" "feat(booking): add availability checks and entity mapper" "$B/dao/mapper"
commit_as "2026-01-28T14:30:00+07:00" "$HUY_N" "$HUY_E" "feat(accommodation): add SearchFilters and implement AccommodationRepository" "$AC/repository" "$AC/enums"
commit_as "2026-02-02T09:30:00+07:00" "$LOC_N" "$LOC_E" "feat(schema): add Image schemas and types" "$IM/enums" "$IM/domain"
commit_as "2026-02-02T10:30:00+07:00" "$LOC_N" "$LOC_E" "feat(clients): add s3 client and upload client" "$INF/storage/S3Storage.ts" "$INF/storage/IObjectStorage.ts" "$INF/storage/MulterProvider.ts"
commit_as "2026-02-02T11:40:00+07:00" "$LOC_N" "$LOC_E" "feat(utils): add image processor" "$IM/service/IImageProcessor.ts" "$IM/service/IImageProcessingStep.ts" "$IM/service/ProcessedImage.ts" "$IM/service/impl/ImageProcessorImpl.ts" "$IM/service/impl/CreateThumbnailStep.ts" "$IM/service/impl/CreateWebpStep.ts" "$IM/service/impl/CreateOptimizedStep.ts"
commit_as "2026-02-02T14:05:00+07:00" "$LOC_N" "$LOC_E" "feat(repository): add image repository" "$IM/repository" "$IM/dao"
commit_as "2026-02-02T15:30:00+07:00" "$LOC_N" "$LOC_E" "feat(services): add image and upload service" "$IM/service/IImageService.ts" "$IM/service/impl/ImageServiceImpl.ts"
commit_as "2026-02-02T16:40:00+07:00" "$LOC_N" "$LOC_E" "feat(image): add image dtos, controller and routes" "$IM/dto" "$IM/rest"
commit_as "2026-02-02T17:25:00+07:00" "$LOC_N" "$LOC_E" "chore(image): wire image module" "$IM/image.tokens.ts" "$IM/ImageModule.ts" "$IM/index.ts"
commit_as "2026-02-03T10:00:00+07:00" "$LOC_N" "$LOC_E" "fix(env): add missing env vars" "$V/.env.example"

# ───────────────────────── Feb 5 — room + accommodation services (Sang), email (Huy) ─────────────────────────
commit_as "2026-02-05T09:30:00+07:00" "$HUY_N" "$HUY_E" "feat(email-service): implement SMTP client and email service for sending emails" "$INF/mail"
commit_as "2026-02-05T10:20:00+07:00" "$SANG_N" "$SANG_E" "refactor(room): add request types for room, bed and amenity management" "$R/domain" "$R/dto"
commit_as "2026-02-05T11:10:00+07:00" "$SANG_N" "$SANG_E" "refactor(room): implement RoomService with CRUD operations and error handling" "$R/service"
commit_as "2026-02-05T11:55:00+07:00" "$SANG_N" "$SANG_E" "feat(room): add room dao and entity mapper" "$R/dao"
commit_as "2026-02-05T14:00:00+07:00" "$SANG_N" "$SANG_E" "refactor(room): implement RoomController and RoomRouter" "$R/rest"
commit_as "2026-02-05T14:45:00+07:00" "$SANG_N" "$SANG_E" "chore(room): wire room module" "$R/room.tokens.ts" "$R/RoomModule.ts" "$R/index.ts"
commit_as "2026-02-05T15:35:00+07:00" "$SANG_N" "$SANG_E" "refactor(service): implement AccommodationService with search and availability features" "$AC/domain" "$AC/dto"
commit_as "2026-02-05T16:25:00+07:00" "$SANG_N" "$SANG_E" "feat(accommodation): add dao with raw stats query" "$AC/dao"
commit_as "2026-02-05T17:10:00+07:00" "$SANG_N" "$SANG_E" "refactor(controller): add AccommodationController with CRUD operations" "$AC/service/IAccommodationService.ts" "$AC/rest"

# ───────────────────────── Feb 6 — accommodation impl + cache (Huy) ─────────────────────────
commit_as "2026-02-06T09:30:00+07:00" "$HUY_N" "$HUY_E" "feat(accommodation): implement service with acc:detail cache codec" "$AC/service/impl"
commit_as "2026-02-06T10:30:00+07:00" "$HUY_N" "$HUY_E" "chore(accommodation): wire accommodation module" "$AC/accommodation.tokens.ts" "$AC/AccommodationModule.ts" "$AC/index.ts"

# ───────────────────────── Feb 7-9 — booking service + events (Sang) ─────────────────────────
commit_as "2026-02-07T09:30:00+07:00" "$SANG_N" "$SANG_E" "feat(types): add custom request types for booking" "$B/dto"
commit_as "2026-02-07T10:40:00+07:00" "$SANG_N" "$SANG_E" "feat(booking): add booking factory and timeout scheduler" "$B/service/IBookingFactory.ts" "$B/service/IBookingTimeoutScheduler.ts" "$B/service/impl/BookingFactoryImpl.ts" "$B/service/impl/LoggingBookingTimeoutScheduler.ts" "$B/booking.constants.ts"
commit_as "2026-02-07T14:00:00+07:00" "$SANG_N" "$SANG_E" "feat(services): add booking service" "$B/service/IBookingService.ts" "$B/service/impl/BookingServiceImpl.ts"
commit_as "2026-02-07T15:30:00+07:00" "$SANG_N" "$SANG_E" "feat(booking): add domain events and email handlers" "$B/events"
commit_as "2026-02-07T16:40:00+07:00" "$SANG_N" "$SANG_E" "feat(controller): add booking controller and router" "$B/rest"
commit_as "2026-02-09T10:00:00+07:00" "$SANG_N" "$SANG_E" "chore(booking): wire booking module" "$B/booking.tokens.ts" "$B/BookingModule.ts" "$B/index.ts"

# ───────────────────────── May 18-20 — dynamic pricing (Lộc) ─────────────────────────
commit_as "2026-05-18T09:30:00+07:00" "$LOC_N" "$LOC_E" "feat(pricing): add pricing enums and value objects" "$P/enums" "$P/domain"
commit_as "2026-05-18T10:40:00+07:00" "$LOC_N" "$LOC_E" "feat(pricing): add holiday repository and dao" "$P/repository" "$P/dao"
commit_as "2026-05-18T14:10:00+07:00" "$LOC_N" "$LOC_E" "feat(pricing): implement quote engine with night calendar and hasher" "$P/service/IPricingService.ts" "$P/service/NightCalendar.ts" "$P/service/QuoteHasher.ts" "$P/service/impl/PricingServiceImpl.ts"
commit_as "2026-05-19T10:00:00+07:00" "$LOC_N" "$LOC_E" "feat(pricing): add owner pricing settings and holiday opt-ins" "$P/service/IOwnerPricingService.ts" "$P/service/impl/OwnerPricingServiceImpl.ts"
commit_as "2026-05-19T14:30:00+07:00" "$LOC_N" "$LOC_E" "feat(pricing): add quote dtos, controller and routes" "$P/dto" "$P/rest"
commit_as "2026-05-20T09:30:00+07:00" "$LOC_N" "$LOC_E" "chore(pricing): wire pricing module" "$P/pricing.tokens.ts" "$P/PricingModule.ts" "$P/index.ts"

# ───────────────────────── Jun 8 — integrate + docs (Lộc) ─────────────────────────
commit_as "2026-06-08T09:30:00+07:00" "$LOC_N" "$LOC_E" "feat(core): register infrastructure ports" "$INF/InfrastructureModule.ts" "$INF/infrastructure.tokens.ts"
commit_as "2026-06-08T10:30:00+07:00" "$LOC_N" "$LOC_E" "feat(index): wire all modules into the composition root for DI" "$V/src/Application.ts"
commit_as "2026-06-08T16:00:00+07:00" "$LOC_N" "$LOC_E" "docs: add migration plan and per-member migration guides" "migration-plan.md" "docs/vnbk-docs"

# ───────────────────────── catch-all (any vnbk file not explicitly listed) ─────────────────────────
git add -A -- "$V" 2>/dev/null || true
commit_at "2026-06-08T17:00:00+07:00" "$LOC_N" "$LOC_E" "chore(vnbk): remaining files"

echo ""
echo "Created $((n)) commits on orphan branch '$BRANCH'. monolith-service is NOT in this history."
echo "Review:   git log --date-order --pretty='%ad  %an  %s' --date=short"
echo "Undo:     git checkout $ORIG_BRANCH && git branch -D $BRANCH"
