import type { Booking } from "@/modules/booking/domain/Booking";
import type { QuoteResponse } from "@/modules/pricing";
import type { CreateBookingRequest } from "@/modules/booking/dto/request/CreateBookingRequest";
import type { EBookingStatus } from "@/modules/booking/enums/EBookingStatus";

/**
 * Builds a Booking aggregate from a validated request + the freshly computed
 * quote: generates the reference number, embeds the verbatim pricing snapshot,
 * derives the total from the quote, and assembles the detail lines. Keeps that
 * assembly out of the thin service.
 */
export interface IBookingFactory {
	build(userId: string, request: CreateBookingRequest, quote: QuoteResponse, status: EBookingStatus): Booking;
}
