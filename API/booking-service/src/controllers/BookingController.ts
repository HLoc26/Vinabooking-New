import type { Request, Response } from "express";
import ResponseHelper from "../utils/ResponseHelper";
import type { ApiResponse } from "../types/Response";
import BookingService from "../services/BookingService";
import { AuthenticatedRequest, BookingRequest, ConfirmRequest } from "../types/Request";
import BookingRepository from "../repositories/BookingRepository";
import { BookingResponse } from "../types/Response";
import { ConfirmationEmailData, EmailServiceClient } from "../clients/EmailServiceClient";
import axios from "axios";
import { AccommodationPayload } from "../types/Accommodation";

export default class BookingController {
	constructor(
		private readonly bookingService: BookingService,
		private readonly bookingRepository: BookingRepository
	) {}
	// public async getBookingById(req: Request, res: Response<ApiResponse>) {
	//     try {
	//         const { id } = req.params;
	//         const booking = await this.bookingService.getBookingById(id);
	//         return ResponseHelper.success(res, { booking });
	//     } catch (err: any) {
	//         return ResponseHelper.error(res, err.message);
	//     }
	// }

	// public async getBookingsByUserId(req: Request, res: Response<ApiResponse>) {
	//     try {
	//         const { userId } = req.params;
	//         const bookings = await this.bookingService.getBookingsByUserId(userId);
	//         return ResponseHelper.success(res, { bookings });
	//     } catch (err: any) {
	//         return ResponseHelper.error(res, err.message);
	//     }
	// }
	public async getBookings(req: Request, res: Response<ApiResponse<BookingResponse | BookingResponse[]>>) {
		const { entity, id } = req.query;

		try {
			if (!entity || !id) {
				return ResponseHelper.error(res, "Missing 'entity' or 'id' query parameter");
			}

			let bookings;

			switch (entity) {
				// case "accommodation":
				//     bookings = await AccommodationServiceClient.getAccommodationsByRoomId(String(id));
				//     break;
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
			return ResponseHelper.success(res, bookings);
		} catch (err: unknown) {
			const e = err as Error;
			return ResponseHelper.error(res, e.message);
		}
	}
	public async createBooking(req: AuthenticatedRequest, res: Response<ApiResponse<BookingResponse>>) {
		try {
			const userId = req.user?.id; // comes from middleware
			if (!userId) {
				return ResponseHelper.error(res, "User not authenticated");
			}

			const bookingData = {
				...req.body,
				userId, // attach authenticated user
				status: "PENDING",
				referenceNo: Number((Date.now() % 1e7) * 100 + Math.floor(Math.random() * 100)),
			};

			const newBooking = await this.bookingRepository.createBooking(bookingData);
			return ResponseHelper.success(res, newBooking, 201);
		} catch (err: unknown) {
			const e = err as Error;
			return ResponseHelper.error(res, e.message);
		}
	}

	public async createDraftBooking(req: BookingRequest, res: Response<ApiResponse<BookingResponse>>) {
		try {
			const bookingData = { ...req.body, status: "DRAFT", referenceNo: Number((Date.now() % 1e7) * 100 + Math.floor(Math.random() * 100)) };
			const newBooking = await this.bookingRepository.createBooking(bookingData);
			return ResponseHelper.success(res, newBooking, 201);
		} catch (err: unknown) {
			const e = err as Error;
			return ResponseHelper.error(res, e.message);
		}
	}
	public async confirmBooking(req: ConfirmRequest, res: Response<ApiResponse<BookingResponse>>) {
		try {
			const { id } = req.body;
			if (!id) return ResponseHelper.error(res, "Missing booking ID in request body");

			// 1. Confirm booking
			const booking = await this.bookingRepository.confirmBooking(id);
			console.log(`[BookingController] Booking confirmed: ${JSON.stringify(booking)}`);
			if (!booking) return ResponseHelper.error(res, "Booking not found");

			const firstDetail = booking.details[0];

			// 2. Get accommodation
			const accommodationRes = await axios.get<AccommodationPayload>(`${process.env.ACCOMMODATION_ENDPOINT}?byEntity=room&entityId=${firstDetail.itemId}`);
			const accommodation = accommodationRes.data;

			// 3. Get user
			console.log(`[BookingController] Fetching user data for userId: ${booking.userId} and url: ${process.env.USER_ENDPOINT}/${booking.userId}`);
			const userRes = await axios.get(`${process.env.USER_ENDPOINT}${booking.userId}`);
			console.log("[BookingController] Fetched user data:");
			console.log(userRes.data.data);
			const user = userRes.data.data;

			// 4. Build check-in / check-out display format
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

			// 5. Prepare email payload
			const emailData: ConfirmationEmailData = {
				to: user.email,
				accommodation,
				checkIn,
				checkOut,
				guestName: user.name,
				referenceNo: booking.referenceNo,
				roomType: firstDetail.itemType,
				guestCount: booking.guestCount,
				nights: firstDetail.count,
				specialRequest: firstDetail.note || undefined,
				totalCharge: undefined, // or calculate if needed
			};

			// 6. Send email
			const emailClient = new EmailServiceClient();
			console.log("[BookingController] Sending confirmation email with data:");
			console.log(emailData);
			await emailClient.sendConfirmationEmail(emailData);

			// 7. Return to FE
			return ResponseHelper.success(res, booking);
		} catch (err) {
			const e = err as Error;
			return ResponseHelper.error(res, e.message);
		}
	}
}
