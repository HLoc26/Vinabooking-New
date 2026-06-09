import { injectable } from "tsyringe";
import type { IBookingFactory } from "@/modules/booking/service/IBookingFactory";
import { Booking } from "@/modules/booking/domain/Booking";
import { BookingDetail } from "@/modules/booking/domain/BookingDetail";
import type { PricingSnapshot } from "@/modules/booking/domain/PricingSnapshot";
import type { EBookingStatus } from "@/modules/booking/enums/EBookingStatus";
import type { CreateBookingRequest } from "@/modules/booking/dto/request/CreateBookingRequest";
import type { QuoteResponse } from "@/modules/pricing";

/**
 * Default factory for new bookings. Ports the monolith's create logic: the total
 * is the quote's payable price, the snapshot is the full quote + resolved window
 * (the authoritative transaction record, spec §1.4), and the reference number is
 * the same time-based pseudo-random scheme.
 */
@injectable()
export class BookingFactoryImpl implements IBookingFactory {
	public build(userId: string, request: CreateBookingRequest, quote: QuoteResponse, status: EBookingStatus): Booking {
		const startDate = new Date(request.startDate);
		const endDate = new Date(request.endDate);

		const snapshot: PricingSnapshot = {
			...quote,
			checkIn: startDate.toISOString(),
			checkOut: endDate.toISOString(),
			bookedAt: request.bookedAt,
		};

		const details = request.details.create.map((d) =>
			BookingDetail.create({
				itemId: d.itemId,
				itemType: d.itemType,
				count: d.count,
				note: d.note ?? null,
			})
		);

		return Booking.create({
			status,
			startDate,
			endDate,
			guestCount: request.guestCount,
			leaderName: request.leaderName,
			leaderEmail: request.leaderEmail,
			phone: request.phone ?? null,
			totalPrice: quote.totals.payablePrice,
			pricingSnapshot: snapshot,
			referenceNo: this.generateReferenceNo(),
			note: null,
			noteBy: null,
			userId,
			details,
		});
	}

	/** Time-based pseudo-random reference number (ported verbatim from the monolith). */
	private generateReferenceNo(): number {
		return Number((Date.now() % 1e7) * 100 + Math.floor(Math.random() * 100));
	}
}
