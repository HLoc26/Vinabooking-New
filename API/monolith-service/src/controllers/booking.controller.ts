import type { Request, Response } from "express";
import ResponseHelper from "@/utils/response";
import type { ApiResponse } from "@/types/responses";
import { BookingService } from "@/services";
import { BookingPayload, BookingRequest, ConfirmRequest } from "@/types/requests";
import { Booking } from "@/generated/client";

export default class BookingController {
	constructor(private readonly bookingService: BookingService) {}

	public async getBookings(req: Request, res: Response<ApiResponse<Booking | Booking[]>>) {
		const { entity, id } = req.query;

		try {
			if (!entity || !id) {
				return ResponseHelper.error(res, "Missing 'entity' or 'id' query parameter");
			}

			let bookings: Booking | Booking[];

			switch (entity) {
				case "accommodation":
					bookings = await this.bookingService.getBookingsByAccommodationId(String(id));
					break;
				case "user":
					bookings = await this.bookingService.getBookingsByUserId(String(id));
					break;
				case "room":
					bookings = await this.bookingService.getBookingsByRoomId(String(id));
					break;
				case "booking":
				case "id":
					bookings = await this.bookingService.getBookingById(String(id));
					break;
				default:
					return ResponseHelper.error(res, `Invalid entity type: ${entity}`);
			}
			return ResponseHelper.success<Booking | Booking[]>(res, bookings);
		} catch (err: unknown) {
			const e = err as Error;
			return ResponseHelper.error(res, e.message);
		}
	}
	public async createBooking(req: BookingRequest, res: Response<ApiResponse<Booking>>) {
		try {
			const userId = req.userId; // comes from middleware
			if (!userId) {
				return ResponseHelper.error(res, "User not authenticated");
			}

			const data: BookingPayload = req.body;
			const newBooking = await this.bookingService.createBooking(userId, data);

			return ResponseHelper.success(res, newBooking, 201);
		} catch (err: unknown) {
			const e = err as Error;
			return ResponseHelper.error(res, e.message);
		}
	}
	public async createDraftBooking(req: BookingRequest, res: Response<ApiResponse<Booking>>) {
		try {
			const userId = req.userId; // comes from middleware
			if (!userId) {
				return ResponseHelper.error(res, "User not authenticated");
			}

			const data: BookingPayload = req.body;
			const newBooking = await this.bookingService.createDraftBooking(userId, data);

			return ResponseHelper.success<Booking>(res, newBooking, 201);
		} catch (err: unknown) {
			const e = err as Error;
			return ResponseHelper.error(res, e.message);
		}
	}

	public async confirmBooking(req: ConfirmRequest, res: Response<ApiResponse<Booking>>) {
		try {
			const { id } = req.body;
			if (!id) return ResponseHelper.error(res, "Missing booking ID in request body");

			const booking = await this.bookingService.confirmBooking(id);

			return ResponseHelper.success(res, booking);
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
