# vnbk-docs — Monolith → vnbk-service migration guide (per member, per feature)

These docs help the three original authors of `API/monolith-service/` navigate the rewrite in
`API/vnbk-service/` (the pure-OOP "Java-in-TypeScript" modular monolith). For **each feature you
originally built**, you'll find:

- the **monolith files** you wrote,
- the **vnbk-service files** they became (or **DEFERRED** if not yet ported — follow `API/vnbk-service/RECIPE.md`),
- what to **investigate / learn** in the new codebase.

## The team (from `git shortlog` on `API/monolith-service/`)

| Member | Git identity | Original focus (by creation + dominant commits) |
|---|---|---|
| **Lộc** (Lead) | Đặng Hữu Lộc `<dhl26052004@gmail.com>` | Platform/architecture, Identity (auth/oauth/user), Image, Search (AI/Pinecone), Dynamic Pricing, Review-AI-summary + background workers |
| **Sang** | sang-ute / Nguyen Quang Sang `<nqs28012004@gmail.com>` | Room, Booking, Review data layer, Payment (PayOS), owner-booking endpoints |
| **Huy** | zhwy512 / Huy Nguyen `<huyngh05@gmail.com>` | Accommodation, Owner (profile/dashboard/draft), Facility, Amenity, Review service/REST, Favourite, Email |

> Ownership overlaps in the monolith (e.g. accommodation was created by Sang, then dominated by Huy;
> review touched all three). Each doc lists **your primary features**; shared features are cross-noted.

## What's converted vs deferred in vnbk-service

The rewrite committed to a **dependency-core slice** first; leaf domains follow the documented recipe.

| Domain | Status in vnbk-service | Member doc |
|---|---|---|
| Platform / DI / kernel / infra | ✅ Converted | Lộc |
| User | ✅ Converted (`modules/user`) | Lộc |
| Auth + OAuth | ✅ Converted (`modules/auth`) | Lộc |
| Image | ✅ Converted (`modules/image`) | Lộc |
| Pricing (dynamic) | ✅ Converted (`modules/pricing`) | Lộc |
| Room | ✅ Converted (`modules/room`) | Sang |
| Booking | ✅ Converted (`modules/booking`) | Sang |
| Accommodation | ✅ Converted (`modules/accommodation`) | Huy |
| Search (AI/Pinecone/Gemini) | ⏳ Deferred → RECIPE | Lộc |
| Review + Review-summary + workers | ⏳ Deferred → RECIPE | Huy (service/REST) / Lộc (AI) / Sang (data) |
| Payment (PayOS) | ⏳ Deferred → RECIPE | Sang |
| Owner (profile/dashboard/draft) | ⏳ Deferred → RECIPE | Huy |
| Facility / Amenity catalogs | ⏳ Deferred → RECIPE | Huy |
| Favourite | ⏳ Deferred → RECIPE | Huy |
| Email (transport) | ✅ Now infra (`SmtpMailSender`) | Huy (templates move to consumers) |

## The 5 architectural shifts everyone must learn first

Read these before your per-feature section — they apply to every domain:

1. **3-way model split.** Prisma entity (`@/generated/client`, only in `dao/` + `dao/mapper/`) →
   **domain model** (`domain/`, rich class with behavior) → **DTO** (`dto/request|response/`).
   Mappers translate between them. Your old "service returns Prisma type" is gone.
2. **Interface + impl, one type per file.** `IXService` (`service/`) + `XServiceImpl`
   (`service/impl/`); `IXRepository` (`repository/`) + `XDao` (`dao/`). I-prefix + `Impl`/`Dao`.
3. **DI container (tsyringe).** No more manual `new` chains or `setX()` setter injection in
   `index.ts`. Each module has an `XModule` that binds tokens; `src/Application.ts` is the
   composition root. The booking↔accommodation↔room cycle is **gone** (see Sang's doc).
4. **Rich domain + thin service.** Business rules (e.g. "a booking is only cancellable when
   PENDING/BOOKED") live in the domain class, not the service. See `modules/booking/domain/Booking.ts`.
5. **Cross-cutting via ports + events.** Redis, S3, Cognito, SMTP are ports in `infrastructure/`.
   Cross-module side-effects (confirmation/cancellation emails) go through **domain events**
   (`shared/events/`), not direct service calls.

## Start here, in this order
1. `API/vnbk-service/RECIPE.md` — the module template (your contract for any deferred work).
2. `API/vnbk-service/src/modules/user/` — the smallest complete reference module.
3. Your member doc below.

- **Lộc** → [`01-loc-platform-identity-intelligence.md`](./01-loc-platform-identity-intelligence.md)
- **Sang** → [`02-sang-room-booking-payment.md`](./02-sang-room-booking-payment.md)
- **Huy** → [`03-huy-accommodation-owner-content.md`](./03-huy-accommodation-owner-content.md)
- Backdated git history → [`COMMIT-PLAN.md`](./COMMIT-PLAN.md) + [`backdated-commits.sh`](./backdated-commits.sh)
