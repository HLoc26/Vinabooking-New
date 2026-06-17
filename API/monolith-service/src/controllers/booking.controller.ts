import type { Request, Response } from "express";
import ResponseHelper from "@/utils/response";
import type { ApiResponse } from "@/dto/response";
import { BookingService, PaymentService } from "@/services";
import { BookingPayload, BookingRequest, ConfirmRequest } from "@/dto/request/booking.dto";
import { BookingDto, toBookingDto } from "@/dto/response/booking.dto";
import { Booking as DomainBooking } from "@/models/booking";

export default class BookingController {
	constructor(
		private readonly bookingService: BookingService,
		private readonly paymentService: PaymentService
	) {}

	public async getBookings(req: Request, res: Response<ApiResponse<BookingDto | BookingDto[]>>) {
		const { entity, id } = req.query;

		try {
			if (!entity || !id) {
				return ResponseHelper.error(res, "Missing 'entity' or 'id' query parameter");
			}

			let domainBookings: DomainBooking | DomainBooking[];

			switch (entity) {
				case "accommodation":
					domainBookings = await this.bookingService.getBookingsByAccommodationId(String(id));
					break;
				case "user":
					domainBookings = await this.bookingService.getBookingsByUserId(String(id));
					break;
				case "room":
					domainBookings = await this.bookingService.getBookingsByRoomId(String(id));
					break;
				case "booking":
				case "id":
					domainBookings = await this.bookingService.getBookingById(String(id));
					break;
				default:
					return ResponseHelper.error(res, `Invalid entity type: ${entity}`);
			}
			
			if (Array.isArray(domainBookings)) {
				const bookings = await Promise.all(domainBookings.map(async b => {
					const transfers = await this.paymentService.getTransfersByBookingId(b.getId());
					return toBookingDto(b, transfers);
				}));
				return ResponseHelper.success<BookingDto | BookingDto[]>(res, bookings);
			} else {
				const transfers = await this.paymentService.getTransfersByBookingId(domainBookings.getId());
				const dto = toBookingDto(domainBookings, transfers);
				return ResponseHelper.success<BookingDto | BookingDto[]>(res, dto);
			}
		} catch (err: unknown) {
			const e = err as Error;
			return ResponseHelper.error(res, e.message);
		}
	}
	public async createBooking(req: BookingRequest, res: Response<ApiResponse<BookingDto>>) {
		try {
			const userId = req.userId; // comes from middleware
			if (!userId) {
				return ResponseHelper.error(res, "User not authenticated");
			}

			const data: BookingPayload = req.body;
			const newBooking = await this.bookingService.createBooking(userId, data);
			const dto = toBookingDto(newBooking);

			return ResponseHelper.success(res, dto, 201);
		} catch (err: unknown) {
			const e = err as Error;
			return ResponseHelper.error(res, e.message);
		}
	}
	public async createDraftBooking(req: BookingRequest, res: Response<ApiResponse<BookingDto>>) {
		try {
			const userId = req.userId; // comes from middleware
			if (!userId) {
				return ResponseHelper.error(res, "User not authenticated");
			}

			const data: BookingPayload = req.body;
			const newBooking = await this.bookingService.createDraftBooking(userId, data);
			const dto = toBookingDto(newBooking);

			return ResponseHelper.success<BookingDto>(res, dto, 201);
		} catch (err: unknown) {
			const e = err as Error;
			return ResponseHelper.error(res, e.message);
		}
	}

	public async confirmBooking(req: ConfirmRequest, res: Response<ApiResponse<BookingDto>>) {
		try {
			const { id } = req.body;
			if (!id) return ResponseHelper.error(res, "Missing booking ID in request body");

			const booking = await this.bookingService.confirmBooking(id);
			const dto = toBookingDto(booking);

			return ResponseHelper.success(res, dto);
		} catch (err: unknown) {
			const e = err as Error;
			return ResponseHelper.error(res, e.message);
		}
	}

	public async cancelBooking(req: Request, res: Response<ApiResponse<{ success: boolean }>>) {
		try {
			const { id } = req.query;
			if (!id) return ResponseHelper.error(res, "Missing booking ID in request query");

			const { note } = req.body as { note?: string };
			const result = await this.bookingService.cancelBooking(id as string, {
				note,
				cancelledBy: "traveller",
				requestedByUserId: req.userId,
			});

			return ResponseHelper.success(res, result);
		} catch (err: unknown) {
			const e = err as Error;
			return ResponseHelper.error(res, e.message);
		}
	}
}
