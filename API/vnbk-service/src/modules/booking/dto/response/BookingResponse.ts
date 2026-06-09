import { EBookingStatus } from "@/modules/booking/enums/EBookingStatus";
import { ECancellationSource } from "@/modules/booking/enums/ECancellationSource";
import { BookingDetailResponse } from "@/modules/booking/dto/response/BookingDetailResponse";

/**
 * Wire (and public cross-module) representation of a booking — decoupled from the
 * domain model and persistence. `totalPrice` (a Decimal column) is surfaced as a
 * JS number; `pricingSnapshot` is the verbatim quote snapshot stored at booking
 * time (left as `unknown` here to avoid leaking the pricing module's internals).
 */
export class BookingResponse {
	id!: string;
	referenceNo!: number;
	status!: EBookingStatus;
	startDate!: Date;
	endDate!: Date;
	nights!: number;
	guestCount!: number;
	leaderName!: string | null;
	leaderEmail!: string | null;
	phone!: string | null;
	totalPrice!: number | null;
	note!: string | null;
	noteBy!: ECancellationSource | null;
	userId!: string;
	details!: BookingDetailResponse[];
	pricingSnapshot!: unknown;
	createdAt?: Date;
	updatedAt?: Date;
}
