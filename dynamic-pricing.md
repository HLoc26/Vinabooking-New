# DYNAMIC PRICING SYSTEM SPECIFICATION — VINABOOKING

Architecture spec for the system that automatically adjusts room prices based on Owner-configured rules: Early Bird (book close to check-in), Long Stay (multi-night bookings), and Holidays.

> **Reference stack:** Express + TypeScript, Prisma 7 (MySQL/MariaDB), Redis cache, React 19 + MUI 7. Default currency: VND. Canonical timezone: `Asia/Ho_Chi_Minh`.

---

## 1. DATABASE DESIGN (RUNTIME-OPTIMIZED)

### 1.1. Two-tier dynamic-pricing configuration (Owner-wide → Accommodation)

The system has **no admin portal**. Owners manage everything themselves. Two tiers:

| Tier                       | Stored in                              | Role                                                        | Change semantics                            |
| -------------------------- | -------------------------------------- | ----------------------------------------------------------- | ------------------------------------------- |
| Owner-wide (default)       | `OwnerProfile.dynamicPricingSettings`  | Default applied to every newly created accommodation.       | Only affects accommodations created AFTER.  |
| Per-accommodation (snap)   | `Accommodation.dynamicPricingSettings` | Copy/override snapshot at the time the accommodation is created. | Only affects this specific accommodation.   |

Same pattern for holiday opt-ins (see §1.3).

**JSON structure (shared by both tiers):**

```json
{
  "longStayConfig": {
    "thresholdNights": 3,
    "discountRate": 0.10
  },
  "earlyBirdConfig": {
    "leadDays": 7,
    "discountRate": 0.05
  }
}
```

- **Prisma:** both columns are `Json?` with `@map("dynamic_pricing_settings")`.
- **Validation:** `discountRate ∈ [0, 0.5]`, `thresholdNights ≥ 2`, `leadDays ≥ 1`. Invalid → reject 400.
- **Accommodation create flow:**
  - DTO omits `dynamicPricingSettings` → copy from `OwnerProfile`.
  - DTO provides an object → use it directly (do NOT inherit).
  - DTO is explicit `null` → accommodation has no dynamic pricing (overrides owner default).
- **Per-accommodation edit:** lives in the "Manage Accommodation" page another teammate is building. Out of scope for this doc.

### 1.2. `Room` table (price columns restructured)

- `basePrice` (`Decimal(10,2)`): Replaces the legacy `price` column. Standard per-night rate (`pricingType = PER_NIGHT`).
- `floorPrice` (`Decimal(10,2)`): **ABSOLUTE FLOOR PRICE** per night. After every discount is applied, if the night's price drops below `floorPrice` it is clamped back up to `floorPrice` so the owner cannot lose money. Constraint: `floorPrice ≤ basePrice`.
- **Naming note:** We deliberately avoid `minPrice` because that name is already used in `AccommodationFullInfo` (cheapest room across an accommodation's room list).
- **`Bed` table:** keeps its existing `price` column. When dynamic pricing applies to a `BED` line-item, use `bed.price` as `basePrice` and skip `floorPrice` (beds have no individual floor in v1).
- **Dynamic-pricing scope:** only applies when `Room.pricingType = PER_NIGHT`. Values `PER_PERSON_PER_NIGHT`, `PER_HOUR`, `CUSTOM` fall back to the static path (`finalPrice = basePrice × nights × count`, no dynamic engine).

### 1.3. Holidays — Seeded catalog + Owner opt-in (same two-tier shape as §1.1)

Since there is no admin, holidays are split across three models:

```prisma
// Read-only catalog. Bootstrap via npm run seed:holidays. The app does not CRUD it directly.
model Holiday {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(100)
  date        DateTime @db.Date
  isRecurring Boolean  @default(false) @map("is_recurring")
  @@unique([date])
  @@index([date])
}

// Owner-wide opt-in: owner picks holidays + multipliers on the Settings page.
model OwnerHoliday {
  id              String  @id @default(uuid())
  ownerProfileId  String
  holidayId       Int
  priceMultiplier Decimal @db.Decimal(4, 2)
  enabled         Boolean @default(true)
  @@unique([ownerProfileId, holidayId])
}

// Per-accommodation opt-in: snapshot copy at accommodation create time (overridable).
model AccommodationHoliday {
  id              String  @id @default(uuid())
  accommodationId String
  holidayId       Int
  priceMultiplier Decimal @db.Decimal(4, 2)
  enabled         Boolean @default(true)
  @@unique([accommodationId, holidayId])
}
```

- `Holiday.date` is stored **flat**: the 30/4 - 1/5 long weekend → two separate rows. `isRecurring=true` rows (New Year, National Day, Reunification Day, etc.) are stored under year 2000 — the backend matches them by `MM-DD`. Lunar New Year is stored with explicit years (`isRecurring=false`) because the Gregorian date shifts annually.
- `priceMultiplier` in both opt-in tables: `Decimal(4,2)`, validated `∈ [1, 5]`.
- **Accommodation create flow:** mirrors §1.1 — DTO omits `holidayOptIns` → copy from `OwnerHoliday`; provides an array → bulk-replace with that array; `null` → opts into no holidays.
- **Seed:** `npm run seed:holidays` (script: `src/scripts/seed-holidays.ts`).

### 1.4. `Booking` table (snapshot column)

- New column `pricingSnapshot` (`Json`, nullable): stores the full `pricing` object returned to the customer at the time the booking was placed, including `nightBreakdown[]` (see §3). Reason: after the owner changes config or room pricing, existing bookings must keep their totals intact — this is the legal record of the transaction.

---

## 2. PRICING ALGORITHM (BACKEND SERVICE LAYER)

### 2.1. Core principles

- **No bulk date-range pricing:** avoid the trap where a 4-night stay that includes 1 holiday night gets the entire 4 nights marked up.
- **Per-night loop:** compute the exact price for each night, then sum.
- **Timezone:** every date comparison (lead-days, night enumeration, holiday lookup) is normalized to `Asia/Ho_Chi_Minh` before the time portion is stripped.
- **Decimal-only:** every multiply/add uses `Decimal` (`decimal.js` ships with Prisma). Never downcast to `number` to avoid float drift.
- **Service separation:** a dedicated `PricingService` class. `BookingService._calculateTotalPrice` delegates into `PricingService` so the quote path and the booking-create path share one implementation.

### 2.2. Application order (fixed, do not reorder)

For each night `d`:

```
night(d) = basePrice
         × holidayMultiplier(d)          // 1.0 by default if not a holiday
         × (1 − totalDiscountRate)       // 0 if no discount rule qualifies
night(d) = max(night(d), floorPrice)     // floor clamp
```

`totalDiscountRate` is the sum of every rule that qualifies (`earlyBirdConfig` + `longStayConfig`), capped at `0.5` so the discount cannot run away.

### 2.3. Sequential steps

1. **Step 1 — Locate the date range:** accept `checkIn`, `checkOut`, `bookedAt` (defaults to `now()`). Produce the array of actual stay nights (`checkOut` exclusive). Example: `2026-04-29 → 2026-05-02` → `['2026-04-29', '2026-04-30', '2026-05-01']`.
2. **Step 2 — Look up holidays:** issue one Prisma query:
   - Fetch `Holiday` rows whose `date` is in the night array (`isRecurring = false`).
   - Fetch `Holiday` rows whose `MONTH(date), DAY(date)` matches an MM-DD in the night array (`isRecurring = true`), then remap to the actual year.
   - Combine into a `Map<YYYY-MM-DD, Decimal>` for $O(1)$ lookup.
3. **Step 3 — Compute `earlyBirdQualified`:** `leadDays = floor((checkIn − bookedAt) / 1 day)` (HCM tz). If `leadDays ≥ earlyBirdConfig.leadDays` → apply `earlyBirdConfig.discountRate`.
4. **Step 4 — Compute `longStayQualified`:** if `nights ≥ longStayConfig.thresholdNights` → apply `longStayConfig.discountRate`.
5. **Step 5 — Per-night loop:** initialize `totalListPrice = 0`, `totalPayablePrice = 0`, `breakdown = []`. For each `d`:
   - `listNight = basePrice` (per-night list price when nothing varies).
   - `mult = holidayMap.get(d) ?? 1`.
   - `discountRate = min(0.5, (earlyBirdQualified ? earlyBird.rate : 0) + (longStayQualified ? longStay.rate : 0))`.
   - `payNight = basePrice × mult × (1 − discountRate)`.
   - `payNight = max(payNight, floorPrice)`.
   - `totalListPrice += listNight`; `totalPayablePrice += payNight`.
   - Push an entry into `breakdown` (see §3).
6. **Step 6 — `Bed` line-items:** same loop with `basePrice = bed.price`, no `floorPrice`, using the same `holidayMap` and qualified flags.
7. **Step 7 — Persist snapshot:** when a `Booking` is created, write the full `pricing` object (including `breakdown`) into `Booking.pricingSnapshot`. Subsequent reads load from the snapshot rather than recomputing.

### 2.4. Cache & Invalidation

- `RoomService` caches room/accommodation detail in Redis. When:
  - An owner updates `dynamicPricingSettings` on a specific `Accommodation` → bust the `accommodation:{id}` key and every `room:{id}` key under that accommodation.
  - An owner updates `basePrice` / `floorPrice` on a `Room` → bust `room:{id}` and `accommodation:{accId}` (because the aggregate `minPrice` shifts).
  - Holiday catalog additions/edits/deletes → bust the `pricing:*` namespace if quote caching is enabled (v2). V1 does not cache quote results, so this is a no-op.

---

## 3. API RESPONSE SPECIFICATION

### 3.1. Quote endpoint (new)

`POST /api/v1/pricing/quote`

Request:
```json
{
  "checkIn": "2026-04-29",
  "checkOut": "2026-05-02",
  "items": [
    { "itemType": "ROOM", "itemId": 101, "count": 1 },
    { "itemType": "BED",  "itemId": 55,  "count": 2 }
  ]
}
```

Response (each item gets its own `pricing` block plus a `totals` block):
```json
{
  "currency": "VND",
  "nights": 3,
  "items": [
    {
      "itemType": "ROOM",
      "itemId": 101,
      "name": "Studio Sea-view Balcony",
      "count": 1,
      "pricing": {
        "listPrice": 3600000,
        "payablePrice": 3150000,
        "averagePricePerNight": 1050000,
        "discountApplied": true,
        "holidayApplied": false,
        "nightBreakdown": [
          { "date": "2026-04-29", "list": 1200000, "pay": 1050000, "holidayMultiplier": 1.0, "discountRate": 0.10, "flooredTo": null },
          { "date": "2026-04-30", "list": 1200000, "pay": 1050000, "holidayMultiplier": 1.0, "discountRate": 0.10, "flooredTo": null },
          { "date": "2026-05-01", "list": 1200000, "pay": 1050000, "holidayMultiplier": 1.0, "discountRate": 0.10, "flooredTo": null }
        ]
      }
    }
  ],
  "totals": {
    "listPrice": 3600000,
    "payablePrice": 3150000,
    "discountApplied": true,
    "holidayApplied": false
  }
}
```

_Field semantics:_

- `listPrice`: Theoretical list total (`basePrice × nights × count`). Renamed from the old `originalPrice` to make clear it is the rack rate, not a price "the customer used to pay".
- `payablePrice`: Final total the customer pays (holiday surcharges applied, discounts applied, floor clamp applied).
- `averagePricePerNight = payablePrice / nights / count`. The frontend only renders this — it never computes it.
- `discountApplied`: flag indicating any discount was applied. Set when `totalDiscountRate > 0` on at least one night.
- `holidayApplied`: flag indicating any night in the stay hit a holiday multiplier.
- `nightBreakdown[]`: per-night detail. Required when `discountApplied` or `holidayApplied`, so the FE can explain the math to the customer.
- `flooredTo`: `null` if the floor was not hit, otherwise equals `floorPrice`.

### 3.2. Owner Settings endpoints (Settings page)

| Method | Path                          | Auth        | Description                                                       |
| ------ | ----------------------------- | ----------- | ----------------------------------------------------------------- |
| GET    | `/pricing/holidays`           | public      | Seeded holiday catalog (read-only).                               |
| GET    | `/pricing/owners/me/settings` | owner       | Owner-wide `dynamicPricingSettings`.                              |
| PATCH  | `/pricing/owners/me/settings` | owner       | Update owner-wide settings. Validated per §1.1.                   |
| GET    | `/pricing/owners/me/holidays` | owner       | Owner-wide holiday opt-ins.                                       |
| PUT    | `/pricing/owners/me/holidays` | owner       | Bulk-replace opt-ins: `[{ holidayId, priceMultiplier, enabled? }]`. |

Owner-wide changes **do not** invalidate the cache for existing accommodations, because each accommodation already holds its own snapshot copy. They only affect accommodations created afterwards.

### 3.3. Existing endpoints

- `GET /accommodations/search` and `GET /accommodations/:id/rooms?startDate&endDate`: attach a `pricing` block per room (internally call `PricingService.quote` for that room with `count = 1`).
- `GET /rooms/:id`: if the query carries `checkIn`/`checkOut` → include `pricing`. Without dates → return `basePrice` + `floorPrice` only, the FE renders no badge.
- Search `minPrice` / `maxPrice` filters: in v1 still compare against `Room.basePrice` (the fast path, no dates needed). Document this in the API spec so the FE does not confuse it with `payablePrice`.

### 3.4. Booking creation

- `POST /bookings` no longer accepts `totalPrice` from the FE. The backend calls `PricingService.quote` itself to pin the price, then compares the `quoteHash` (hash of the pricing object) the FE attaches. If the hash mismatches → reject 409 (price changed; the FE must re-quote).
- The backend stores the entire pricing object in `Booking.pricingSnapshot`.

---

## 4. FRONTEND DISPLAY RULES (FE)

The FE performs **zero arithmetic on money values**. Delete the existing `totalPrice` computation in `UI/src/features/booking/services/bookingApi.ts` (currently multiplies `price × count × nights`). Replace it with a `POST /pricing/quote` call and sum the returned `pricing.payablePrice` directly.

- **Price rendering logic:**
  - If `discountApplied == true`: render `listPrice` in small grey text with a strikethrough (`text-decoration: line-through`). Render `payablePrice` larger, bold (`font-weight: bold`), in an attention-grabbing red (`#e53e3e`).
  - If `discountApplied == false`: render only `payablePrice` in default color, no strikethrough (even when `holidayApplied = true`, since `payablePrice ≥ listPrice` in that case — striking through would imply the customer is "losing money").
- **Badge logic:**
  - `holidayApplied == true`: render a small badge next to the price, with a 🔥 icon or the text `"Holiday rate included"`. The tooltip expands `nightBreakdown[]` so the customer sees which nights were marked up.
  - `discountApplied == true`: a secondary badge `"Promotion applied"`. The tooltip lists which rules fired (Early Bird / Long Stay).
- **Currency formatting:** use `formatVND` from `UI/src/utils/moneyConverter.ts`. Never hard-code thousand separators.

---

## 5. ROLLOUT & MIGRATION

Because `Room.price` is read all over the codebase, we split into 4 phases to avoid breaking production:

1. **Phase 1 — Additive schema:**
   - Add `Room.basePrice`, `Room.floorPrice`, `Accommodation.dynamicPricingSettings`, the `Holiday` model, `Booking.pricingSnapshot`.
   - Data migration: `UPDATE Room SET basePrice = price, floorPrice = price`.
2. **Phase 2 — Backend dual-write & quote API:**
   - `PricingService` + `POST /pricing/quote` go live.
   - Search / room-detail endpoints attach a `pricing` block (not yet required by the FE).
   - `BookingService` reads through `PricingService`; `Booking.pricingSnapshot` starts being written.
   - `Room.price` stays around and is dual-written from `basePrice` to keep the API compatible.
3. **Phase 3 — FE switches to `pricing`:**
   - `RoomCard`, `BookingPreviewPage`, search list read `pricing.payablePrice`.
   - Remove the FE `totalPrice` math block.
   - The owner `ManagePricePage` ships alongside (see §6).
4. **Phase 4 — Drop legacy:**
   - Remove the `Room.price` column from the schema and every response.
   - `Room.basePrice` becomes canonical; bed's `price` remains canonical (unchanged).

---

## 6. OWNER UX

### 6.1. Settings page (owner-wide defaults) — Phase 3, in my scope

New page: `UI/src/features/owner/pages/SettingsPage.tsx`:

- **Section 1 — Default configuration:** a `longStayConfig` form (toggle + 2 numeric inputs) and an `earlyBirdConfig` form (toggle + 2 numeric inputs). Validation matches §1.1. Save → `PATCH /pricing/owners/me/settings`.
- **Section 2 — Default holidays:** a table populated from `GET /pricing/holidays`, each row has an opt-in checkbox + a `priceMultiplier` input. Save → `PUT /pricing/owners/me/holidays`.
- Surface a clear notice: "These defaults only apply to **newly created accommodations** after you save. To edit an existing accommodation, open its Manage Accommodation page."

### 6.2. Accommodation creation — Phase 3, in my scope

Add a "Dynamic Pricing" step to the accommodation-create wizard:

- Two radio choices:
  - **Use my default settings** (selected by default): do not send `dynamicPricingSettings` / `holidayOptIns` in the DTO — the backend copies from owner-wide settings.
  - **Customize for this property:** open the same form from §6.1, pre-populated with the owner defaults. Saving sends explicit objects → the backend uses them instead of inheriting.

### 6.3. Manage Accommodation page (edit settings + room pricing) — OUT OF SCOPE

A teammate is implementing this. The backend endpoints it needs (PATCH per-accommodation settings, room basePrice/floorPrice update) will ship in that PR.

---

## 7. OPEN QUESTIONS (V2)

Tracked for future iterations, **not in v1 scope**:

- Bundle/combo discounts (room + bed) beyond per-line discounts.
- Demand-based pricing (driven by pending booking volume / occupancy rate).
- Coupon codes (a separate promotion flow, not part of dynamic pricing).
- Caching quote results in Redis keyed by `(roomId, checkIn, checkOut, configVersion)`.
- Multi-currency (currently hard-coded to VND).
