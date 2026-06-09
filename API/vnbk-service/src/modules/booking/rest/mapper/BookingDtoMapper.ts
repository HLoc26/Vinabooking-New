import { injectable } from "tsyringe";
import type { Booking } from "@/modules/booking/domain/Booking";
import type { BookingDetail } from "@/modules/booking/domain/BookingDetail";
import { BookingResponse } from "@/modules/booking/dto/response/BookingResponse";
import { BookingDetailResponse } from "@/modules/booking/dto/response/BookingDetailResponse";

/** Maps the Booking domain aggregate to its response DTO. */
@injectable()
export class BookingDtoMapper {
	public toResponse(booking: Booking): BookingResponse {
		const response = new BookingResponse();
		response.id = booking.id;
		response.referenceNo = booking.referenceNo;
		response.status = booking.status;
		response.startDate = booking.startDate;
		response.endDate = booking.endDate;
		response.nights = booking.nights();
		response.guestCount = booking.guestCount;
		response.leaderName = booking.leaderName;
		response.leaderEmail = booking.leaderEmail;
		response.phone = booking.phone;
		response.totalPrice = booking.totalPrice;
		response.note = booking.note;
		response.noteBy = booking.noteBy;
		response.userId = booking.userId;
		response.details = booking.details.map((detail) => this.detailToResponse(detail));
		response.pricingSnapshot = booking.pricingSnapshot;
		response.createdAt = booking.createdAt;
		response.updatedAt = booking.updatedAt;
		return response;
	}

	private detailToResponse(detail: BookingDetail): BookingDetailResponse {
		const response = new BookingDetailResponse();
		response.id = detail.id;
		response.itemId = detail.itemId;
		response.itemType = detail.itemType;
		response.count = detail.count;
		response.note = detail.note;
		return response;
	}
}
