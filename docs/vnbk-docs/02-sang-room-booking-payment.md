# Sang — Room, Booking & Payment

**Git identity:** sang-ute / Nguyen Quang Sang `<nqs28012004@gmail.com>` (459 commits)
**Original timeline:** Booking & Room models (Jan 25–28) → Room/Accommodation services (Feb 5) → bulk room fetch (Feb 14–21) → Payment/PayOS (May 1–8) → owner-booking endpoints (May 19)

You built the **transactional core**: the Room inventory, the Booking lifecycle + availability, the
Review data layer, and the Payment/PayOS integration. Two of these (**Room, Booking**) are fully
converted and are the **showcase of the new architecture** — read the "cycle" note carefully.

> Legend: ✅ = converted, ⏳ = deferred (follow `API/vnbk-service/RECIPE.md`).

---

## ⭐ The big change you most need to understand: the cycle is gone

In the monolith you lived with this in `index.ts`:
```ts
bookingService.setAccommodationService(accommodationService);
bookingService.setPricingService(pricingService);
roomService.setPricingService(pricingService);
```
because `RoomService → BookingService → AccommodationService → RoomService` was a circular graph,
patched with setter injection + nullable fields + runtime `if (!this.#pricingService) throw`.

In vnbk-service the cycle is **structurally removed**:
- **room** and **accommodation** no longer depend on booking.
- **availability / booked-counts moved INTO booking** (`modules/booking/dao/BookingDao.countOverlappingBookedItems` + `BookingServiceImpl.assertAvailable`, which reads room capacity via `IRoomService`).
- So the graph is a clean DAG: `booking → {accommodation, room, pricing, user}`; nobody points back.
- Result: **plain constructor injection, no setters, no `delay()`** in `modules/booking/service/impl/BookingServiceImpl.ts`.

That single change is the point of the rewrite — study `BookingServiceImpl`'s constructor.

---

## Feature 1 — Room / Bed / Amenity CRUD ✅
*Monolith: 01-26 RoomRepository + AmenityRepository (Huy created repos); 02-05 RoomService/Controller/Router (you); bunk-bed + quantity logic (Apr 8–12).*

| Monolith | vnbk-service | Note |
|---|---|---|
| `repositories/room.repository.ts` (CRUD, filter, ownership checks, bed/amenity diff-sync) | `modules/room/repository/IRoomRepository.ts` + `dao/RoomDao.ts` + `dao/mapper/RoomEntityMapper.ts` | bunk-bed normalization + diff-sync ported into `RoomDao`. |
| `services/room.service.ts` (`getRoomsByAccommId`, price preview) | `modules/room/service/{IRoomService,impl/RoomServiceImpl}.ts` | price preview uses `IPricingService.quote`. |
| `controllers/room.controller.ts`, `routes/room.routes.ts` (incl. `GET /rooms?id=` bulk) | `modules/room/rest/{RoomController,RoomRouter,mapper/RoomDtoMapper}.ts` | bulk = `getRoomsByMultipleIds`. |
| `types/room.types.ts` (`CreateRoomDTO`, `UpdateRoomDTO`, bed batch) | `modules/room/dto/request/{CreateRoomRequest,UpdateRoomRequest,CreateBedRequest,UpdateBedRequest}.ts` (class-validator) + `dto/response/{RoomResponse,BedResponse,AmenityResponse}.ts` |
| Room/Bed/Amenity Prisma types used directly | `modules/room/domain/{Room,Bed,Amenity,AmenityConfig}.ts` + `enums/{EBedType,EViewType,EPricingType,EAmenityType}.ts` |

**Investigate/learn:** `RoomEntityMapper` (Decimal `base_price`/`floor_price`/`size`/bed `price` → numbers),
and the `// NOTE: availability moved to booking module` markers — your old `remainingQuantity =
quantity − bookedCount` is intentionally not here anymore.

---

## Feature 2 — Booking lifecycle (create / draft / confirm / cancel) ✅
*Monolith: 01-25 Booking+BookingDetail models + BookingRepository; 01-28 availability checks; 02-07 booking.service/controller/router (Lộc seeded, you + Huy maintained).*

The monolith `BookingService.cancelBooking` was ~60 lines doing: ownership check + status guard + DB
update + accommodation lookup + user lookup + dual email send. In vnbk that logic is **split by
responsibility**:

| Monolith concern | vnbk-service home |
|---|---|
| status guard (`status !== "PENDING" && !== "BOOKED"`), ownership (`booking.userId !== requestedBy`) | **domain** — `modules/booking/domain/Booking.ts` (`isCancellable()`, `cancel(source,note)`, `confirm()`, `belongsTo()`, `nights()`) |
| orchestration (load → mutate → save → notify) | `modules/booking/service/impl/BookingServiceImpl.ts` (thin: ~load, call domain method, save, publish events) |
| build `Prisma.BookingCreateInput` inline (referenceNo, snapshot, status) | `modules/booking/service/{IBookingFactory,impl/BookingFactoryImpl}.ts` |
| quote-hash check (`PRICE_CHANGED`) | stays in `BookingServiceImpl.create` via `IPricingService.quote` |
| email send (confirmation/cancellation) | **domain events** → `modules/booking/events/{BookingConfirmedEvent,BookingCancelledEvent}.ts` + `events/handlers/Send*EmailHandler.ts` (use `IMailSender` + `IAccommodationService` + `IUserService`) |
| BullMQ timeout enqueue/remove | `modules/booking/service/{IBookingTimeoutScheduler,impl/LoggingBookingTimeoutScheduler}.ts` — **stub** (real worker ⏳, see Lộc's doc) |

| Monolith file | vnbk-service file |
|---|---|
| `repositories/booking.repository.ts` (findById/byUser/byAccomm, availability, cancel/confirm, counts) | `modules/booking/repository/IBookingRepository.ts` + `dao/BookingDao.ts` + `dao/mapper/BookingEntityMapper.ts` |
| `services/booking.service.ts` | `modules/booking/service/impl/BookingServiceImpl.ts` + `domain/{Booking,BookingDetail,PricingSnapshot}.ts` |
| `controllers/booking.controller.ts`, `routes/booking.routes.ts` | `modules/booking/rest/{BookingController,BookingRouter,mapper/BookingDtoMapper}.ts` |
| `types/requests/booking.requests.ts` (`BookingPayload`) | `modules/booking/dto/request/{CreateBookingRequest,BookingDetailsRequest,BookingDetailRequest,ConfirmBookingRequest,CancelBookingRequest}.ts` |
| `constants/booking.ts` | `modules/booking/booking.constants.ts` |
| Booking status/cancellation/item enums | `modules/booking/enums/{EBookingStatus,ECancellationSource,EItemType}.ts` |

**Investigate/learn (in order):**
1. `modules/booking/domain/Booking.ts` — see the rules you used to write in the service now living as
   methods that raise domain events.
2. `BookingServiceImpl.confirm/cancel` — `repo.findById` → `booking.belongsTo` → `booking.cancel(...)`
   → `repo.update` → `pullDomainEvents()` + `eventPublisher.publish(e)`. The service never assembles email.
3. `BookingModule.register` — how the two email handlers `subscribe` to the events.
4. `assertAvailable` — booked-count from booking's own tables + capacity from `IRoomService`.

---

## Feature 3 — Bulk room info fetch ✅ (folded into room)
*Monolith: 02-14 "bulk info fetching of rooms", 02-20 "GET /rooms?id= instead of /bulk".*

Your `GET /rooms?id=a,b,c` bulk endpoint → `modules/room` `IRoomService.getRoomsByMultipleIds` +
`RoomController` (the `GET /rooms?id=` route). No separate module.

---

## Feature 4 — Review data layer ⏳ DEFERRED
*Monolith: 01-27 Review model + ReviewRepository; 03-02 getMyReviewByBooking / findByAccommodationId with replies.*

You created the Review **data layer**; Huy built the service/REST and Lộc the AI-summary. The whole
review domain is **deferred**. When the team ports it (follow `RECIPE.md`), your part maps to:

| Monolith (to port) | Suggested vnbk-service target |
|---|---|
| `repositories/review.repository.ts` (CRUD, replies, by-accommodation, unique-by-booking) | `modules/review/repository/IReviewRepository.ts` + `dao/ReviewDao.ts` |
| Review model + types | `modules/review/domain/Review.ts`, `dto/*`, `enums/*` |

**Investigate/learn before porting:** `modules/booking` (review references a booking) and
`modules/accommodation` (reviews attach to an accommodation) public barrels.

---

## Feature 5 — Payment / PayOS ⏳ DEFERRED
*Monolith: 05-01 PaymentTransfer model + status enum; 05-03 PaymentService + PayOS + controller; 05-08 repo methods.*

Fully deferred. Suggested target when porting:

| Monolith (to port) | Suggested vnbk-service target |
|---|---|
| `clients/` PayOS usage / `services/payos.service.ts` | `infrastructure/payment-gateway/{IPaymentGateway,PayosGateway}.ts` (port + `@singleton`) |
| `services/payment.service.ts` | `modules/payment/service/{IPaymentService,impl/PaymentServiceImpl}.ts` |
| `repositories/payment.repository.ts` | `modules/payment/repository/IPaymentRepository.ts` + `dao/PaymentDao.ts` (PaymentTransfer) |
| `controllers/payment.controller.ts`, `routes/payment.routes.ts` | `modules/payment/rest/*` |

**Architecture tip:** the monolith's "fail pending PaymentTransfers when a booking is cancelled"
should become a **handler subscribed to `BookingCancelledEvent`** (already published by booking) —
no direct booking↔payment coupling. That's the cleanest port and demonstrates the event pattern.

---

## Feature 6 — Owner-booking management endpoints ⏳ DEFERRED
*Monolith: 05-19 "owner booking management endpoints" (getOwnerBookings, revokeOwnerBooking), 03-27 dashboard stats.*

The booking domain is converted, but the **owner-facing** booking endpoints
(`getOwnerBookings`, `revokeOwnerBooking`, `getDashboardStatsByRoomIds`) are **not routed yet**.
`IBookingService` already exposes `getBookedCounts` for availability; add the owner read/dashboard
methods + routes following `RECIPE.md` (they belong with Huy's owner module or as booking read-DTOs).

---

## Your fastest path in
1. Read the **"cycle is gone"** section above, then `modules/booking/service/impl/BookingServiceImpl.ts`.
2. `modules/booking/domain/Booking.ts` — your business rules, now as domain behavior + events.
3. `modules/room/` end-to-end (your most-owned converted module).
4. For payment/review: `RECIPE.md` + reuse `BookingCancelledEvent` for the payment-fail flow.
