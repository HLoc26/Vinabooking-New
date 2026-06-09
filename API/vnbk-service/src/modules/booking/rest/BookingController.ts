import { inject, injectable } from "tsyringe";
import type { Request } from "express";
import { BaseController } from "@/http/BaseController";
import { BOOKING_SERVICE } from "@/modules/booking/booking.tokens";
import type { IBookingService } from "@/modules/booking/service/IBookingService";
import { BookingDtoMapper } from "@/modules/booking/rest/mapper/BookingDtoMapper";
import type { CreateBookingRequest } from "@/modules/booking/dto/request/CreateBookingRequest";
import type { ConfirmBookingRequest } from "@/modules/booking/dto/request/ConfirmBookingRequest";
import type { CancelBookingRequest } from "@/modules/booking/dto/request/CancelBookingRequest";
import type { BookingResponse } from "@/modules/booking/dto/response/BookingResponse";
import { BadRequestError } from "@/shared/error/BadRequestError";

@injectable()
export class BookingController extends BaseController {
	constructor(
		@inject(BOOKING_SERVICE) private readonly bookingService: IBookingService,
		private readonly mapper: BookingDtoMapper
	) {
		super();
	}

	public createBooking = this.handle<BookingResponse>(async (req: Request) => {
		const userId = this.requireUserId(req);
		const dto = req.validatedBody as CreateBookingRequest;
		const booking = await this.bookingService.create(userId, dto);
		return this.created(this.mapper.toResponse(booking));
	});

	public createDraftBooking = this.handle<BookingResponse>(async (req: Request) => {
		const userId = this.requireUserId(req);
		const dto = req.validatedBody as CreateBookingRequest;
		const booking = await this.bookingService.createDraft(userId, dto);
		return this.created(this.mapper.toResponse(booking));
	});

	public confirmBooking = this.handle<BookingResponse>(async (req: Request) => {
		const userId = this.requireUserId(req);
		const dto = req.validatedBody as ConfirmBookingRequest;
		const booking = await this.bookingService.confirm(userId, dto.id);
		return this.ok(this.mapper.toResponse(booking));
	});

	public cancelBooking = this.handle<BookingResponse>(async (req: Request) => {
		const userId = this.requireUserId(req);
		const id = req.query.id;
		if (!id || typeof id !== "string") {
			throw new BadRequestError("Missing booking ID in request query");
		}
		const dto = req.validatedBody as CancelBookingRequest;
		const booking = await this.bookingService.cancel(userId, id, dto.note);
		return this.ok(this.mapper.toResponse(booking));
	});
}
