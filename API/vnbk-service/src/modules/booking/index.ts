// Public surface of the booking module. Nothing depends on booking, so this is
// intentionally minimal — only what the composition root needs to wire it.
export type { IBookingService } from "@/modules/booking/service/IBookingService";
export { BOOKING_SERVICE } from "@/modules/booking/booking.tokens";
export { BookingModule } from "@/modules/booking/BookingModule";
export { BookingResponse } from "@/modules/booking/dto/response/BookingResponse";
