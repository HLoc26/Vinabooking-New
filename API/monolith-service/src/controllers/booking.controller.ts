import type { Request, Response } from "express";
import ResponseHelper from "@/utils/response";
import type { ApiResponse } from "@/types/responses";
import { AccommodationService, BookingService, EmailService, UserService } from "@/services";
import { BookingPayload, BookingRequest, ConfirmRequest } from "../types/requests";
import { BookingRepository } from "@/repositories";
import { NotFoundError } from "@/errors";
import { Booking, Prisma } from "@/generated/client";
import { CancellationEmailData, ConfirmationEmailData } from "@/types/email.types";

export default class BookingController {
	constructor(
		private readonly bookingService: BookingService,
		private readonly bookingRepository: BookingRepository,
		private readonly userService: UserService,
		private readonly accommodationService: AccommodationService,
		private readonly emailService: EmailService
	) {}

	public async getBookings(req: Request, res: Response<ApiResponse<Booking | Booking[]>>) {
		const { entity, id } = req.query;

		try {
			if (!entity || !id) {
				return ResponseHelper.error(res, "Missing 'entity' or 'id' query parameter");
			}

			let bookings: Booking | Booking[];

			switch (entity) {
				// case "accommodation":
				//	 bookings = await AccommodationServiceClient.getAccommodationsByRoomId(String(id));
				//	 break;
				// TODO: use repository
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

			const bookingData: Prisma.BookingCreateInput = {
				...data,
				userId, // attach user id
				status: "PENDING",
				referenceNo: Number((Date.now() % 1e7) * 100 + Math.floor(Math.random() * 100)),
			};

			const newBooking = await this.bookingRepository.create(bookingData);
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
			const bookingData: Prisma.BookingCreateInput = { ...req.body, userId, status: "DRAFT", referenceNo: Number((Date.now() % 1e7) * 100 + Math.floor(Math.random() * 100)) };
			const newBooking = await this.bookingRepository.create(bookingData);
			return ResponseHelper.success<Booking>(res, newBooking, 201);
		} catch (err: unknown) {
			const e = err as Error;
			return ResponseHelper.error(res, e.message);
		}
	}

	public async getBookingSummary(req: Request, res: Response) {
		try {
			const { roomIds, startDate, endDate } = req.body;
			if (!roomIds || !Array.isArray(roomIds) || !startDate || !endDate) {
				return ResponseHelper.error(res, "Invalid request body");
			}

			const start = new Date(startDate);
			const end = new Date(endDate);

			const counts = await this.bookingRepository.countBookedRooms(roomIds, start, end);

			const data = roomIds.map((roomId) => ({
				roomId,
				bookedCount: counts[roomId] ?? 0,
			}));

			return ResponseHelper.success(res, data);
		} catch (err: unknown) {
			const e = err as Error;
			return ResponseHelper.error(res, e.message);
		}
	}

	public async confirmBooking(req: ConfirmRequest, res: Response<ApiResponse<Booking>>) {
		try {
			const { id } = req.body;
			if (!id) return ResponseHelper.error(res, "Missing booking ID in request body");

			// 1. Confirm booking
			const booking = await this.bookingRepository.confirm(id);
			console.log(`[BookingController] Booking confirmed: ${JSON.stringify(booking)}`);
			if (!booking) return ResponseHelper.error(res, "Booking not found");

			// Ensure the necessary fields for email are present on the booking object
			if (!booking.leaderEmail || !booking.leaderName) {
				// leaderEmail and leaderName must be in the request
				return ResponseHelper.error(res, "Booking object is missing leaderEmail or leaderName required for confirmation email.");
			}

			const firstDetail = booking.details[0];
			console.log(`[BookingController] Fetching accommodation data: ${firstDetail}`);

			// Get accommodation
			const accommodation = await this.accommodationService.getAccommodationByRoomId(firstDetail.itemId);

			// Get user using booking.leaderEmail and booking.leaderName
			const user = await this.userService.getUserById(booking.userId);

			if (!user) {
				throw new NotFoundError(`User with id ${booking.userId} not found`);
			}

			// Build check-in / check-out display format
			const checkIn = booking.startDate.toLocaleDateString("en-US", {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
			});

			const checkOut = booking.endDate.toLocaleDateString("en-US", {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
			});
			const totalChargeDisplay = booking.totalPrice
				? booking.totalPrice.toString() // Convert Decimal to string if it exists
				: undefined; // Use undefined if totalPrice is null
			// 5. Prepare email payload
			const userEmailData: ConfirmationEmailData = {
				to: user.email,
				accommodation,
				checkIn,
				checkOut,
				guestName: user.name, // guestName as user.name
				referenceNo: booking.referenceNo,
				roomType: firstDetail.itemType,
				guestCount: booking.guestCount,
				nights: firstDetail.count,
				specialRequest: firstDetail.note || undefined,
				totalCharge: totalChargeDisplay,
			};

			const leaderEmailData: ConfirmationEmailData = {
				to: booking.leaderEmail,
				accommodation,
				checkIn,
				checkOut,
				guestName: booking.leaderName, // guestName as booking.leaderName
				referenceNo: booking.referenceNo,
				roomType: firstDetail.itemType,
				guestCount: booking.guestCount,
				nights: firstDetail.count,
				specialRequest: firstDetail.note || undefined,
				totalCharge: totalChargeDisplay,
			};

			// 6. Send email
			await this.emailService.sendConfirmationEmail(userEmailData);
			await this.emailService.sendConfirmationEmail(leaderEmailData);

			// 7. Return to FE
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

			// Confirm booking
			const booking = await this.bookingRepository.cancel(id as string);
			if (!booking) return ResponseHelper.error(res, "Booking not found");

			// Ensure the necessary fields for email are present on the booking object
			if (!booking.leaderEmail || !booking.leaderName) {
				return ResponseHelper.error(res, "Booking object is missing leaderEmail or leaderName required for cancellation email.");
			}

			const firstDetail = booking.details[0];

			// Get accommodation
			const accommodation = await this.accommodationService.getAccommodationByRoomId(firstDetail.itemId);

			// Get user using booking.leaderEmail and booking.leaderName
			const user = await this.userService.getUserById(booking.userId);

			if (!user) {
				throw new NotFoundError(`User with id ${booking.userId} not found`);
			}

			// 4. Prepare email payload
			const userEmailData: CancellationEmailData = {
				to: user.email,
				accommodation,
				guestName: user.name, // guestName as user.name
				referenceNo: booking.referenceNo,
				roomType: firstDetail.itemType,
				nights: firstDetail.count,
			};

			const leaderEmailData: CancellationEmailData = {
				to: booking.leaderEmail,
				accommodation,
				guestName: booking.leaderName, // guestName as booking.leaderName
				referenceNo: booking.referenceNo,
				roomType: firstDetail.itemType,
				nights: firstDetail.count,
			};

			// 5. Send email
			await this.emailService.sendCancellationEmail(userEmailData);
			await this.emailService.sendCancellationEmail(leaderEmailData);

			// 6. Return to FE
			return ResponseHelper.success(res, { success: true });
		} catch (err: unknown) {
			const e = err as Error;
			return ResponseHelper.error(res, e.message);
		}
	}
}
