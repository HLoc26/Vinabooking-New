import { BookingRepository } from "@/repositories";
import { NotFoundError } from "@/errors";
import UserService from "./user.service";
import EmailService from "./email.service";
import AccommodationService from "./accommodation.service";
import { BookingPayload } from "@/types/requests";
import { Prisma } from "@/generated/client";
import { CancellationEmailData, ConfirmationEmailData } from "@/types/email.types";

export default class BookingService {
	readonly #bookingRepository: BookingRepository;
	readonly #userService: UserService;
	readonly #emailService: EmailService;
	#accommodationService?: AccommodationService;

	constructor(bookingRepository: BookingRepository, userService: UserService, emailService: EmailService) {
		this.#bookingRepository = bookingRepository;
		this.#userService = userService;
		this.#emailService = emailService;
	}

	public setAccommodationService(accommodationService: AccommodationService) {
		this.#accommodationService = accommodationService;
	}

	public async getBookingById(id: string) {
		const booking = await this.#bookingRepository.findById(id);
		if (!booking) throw new NotFoundError(`Booking with id ${id} not found`);
		return booking;
	}

	public async getBookingsByAccommodationId(accommId: string) {
		const bookings = await this.#bookingRepository.findByAccommodationId(accommId);
		if (!bookings || bookings.length === 0) throw new NotFoundError(`No bookings found for user ${accommId}`);
		return bookings;
	}

	public async getBookingsByUserId(userId: string) {
		const bookings = await this.#bookingRepository.findByUserId(userId, true);
		//if (!bookings || bookings.length === 0) throw new NotFoundError(`No bookings found for user ${userId}`);
		return bookings || [];
	}

	public async getBookingsByRoomId(roomId: string) {
		const bookings = await this.#bookingRepository.findByRoomId(roomId);
		if (!bookings || bookings.length === 0) throw new NotFoundError(`No bookings found for room ${roomId}`);
		return bookings;
	}

	public async getBookedCounts(roomIds: string[], startDate: Date, endDate: Date) {
		const counts = await this.#bookingRepository.countBookedRooms(roomIds, startDate, endDate);

		return roomIds.map((roomId) => ({
			roomId,
			bookedCount: counts[roomId] ?? 0,
		}));
	}

	public async createBooking(userId: string, data: BookingPayload) {
		const bookingData: Prisma.BookingCreateInput = {
			...data,
			userId,
			status: "PENDING",
			referenceNo: Number((Date.now() % 1e7) * 100 + Math.floor(Math.random() * 100)),
		};

		return await this.#bookingRepository.create(bookingData);
	}

	public async createDraftBooking(userId: string, data: BookingPayload) {
		const bookingData: Prisma.BookingCreateInput = {
			...data,
			userId,
			status: "DRAFT",
			referenceNo: Number((Date.now() % 1e7) * 100 + Math.floor(Math.random() * 100)),
		};
		return await this.#bookingRepository.create(bookingData);
	}

	public async confirmBooking(id: string) {
		if (!this.#accommodationService) throw new Error("AccommodationService not initialized in BookingService");

		// 1. Confirm booking
		const booking = await this.#bookingRepository.confirm(id);
		console.log(`[BookingService] Booking confirmed: ${JSON.stringify(booking)}`);
		if (!booking) throw new NotFoundError("Booking not found");

		// Ensure the necessary fields for email are present on the booking object
		if (!booking.leaderEmail || !booking.leaderName) {
			throw new Error("Booking object is missing leaderEmail or leaderName required for confirmation email.");
		}

		const firstDetail = booking.details[0];

		// Get accommodation
		const accommodation = await this.#accommodationService.getAccommodationByRoomId(firstDetail.itemId);

		// Get user using booking.leaderEmail and booking.leaderName
		const user = await this.#userService.getUserById(booking.userId);

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
		const totalChargeDisplay = booking.totalPrice ? booking.totalPrice.toString() : undefined;

		// 5. Prepare email payload
		const userEmailData: ConfirmationEmailData = {
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
			totalCharge: totalChargeDisplay,
		};

		const leaderEmailData: ConfirmationEmailData = {
			to: booking.leaderEmail,
			accommodation,
			checkIn,
			checkOut,
			guestName: booking.leaderName,
			referenceNo: booking.referenceNo,
			roomType: firstDetail.itemType,
			guestCount: booking.guestCount,
			nights: firstDetail.count,
			specialRequest: firstDetail.note || undefined,
			totalCharge: totalChargeDisplay,
		};

		// 6. Send email
		await this.#emailService.sendConfirmationEmail(userEmailData);
		await this.#emailService.sendConfirmationEmail(leaderEmailData);

		return booking;
	}

	public async cancelBooking(id: string) {
		if (!this.#accommodationService) throw new Error("AccommodationService not initialized in BookingService");

		// Confirm booking
		const booking = await this.#bookingRepository.cancel(id);
		if (!booking) throw new NotFoundError("Booking not found");

		// Ensure the necessary fields for email are present on the booking object
		if (!booking.leaderEmail || !booking.leaderName) {
			throw new Error("Booking object is missing leaderEmail or leaderName required for cancellation email.");
		}

		const firstDetail = booking.details[0];

		// Get accommodation
		const accommodation = await this.#accommodationService.getAccommodationByRoomId(firstDetail.itemId);

		// Get user using booking.leaderEmail and booking.leaderName
		const user = await this.#userService.getUserById(booking.userId);

		if (!user) {
			throw new NotFoundError(`User with id ${booking.userId} not found`);
		}

		// 4. Prepare email payload
		const userEmailData: CancellationEmailData = {
			to: user.email,
			accommodation,
			guestName: user.name,
			referenceNo: booking.referenceNo,
			roomType: firstDetail.itemType,
			nights: firstDetail.count,
		};

		const leaderEmailData: CancellationEmailData = {
			to: booking.leaderEmail,
			accommodation,
			guestName: booking.leaderName,
			referenceNo: booking.referenceNo,
			roomType: firstDetail.itemType,
			nights: firstDetail.count,
		};

		// 5. Send email
		await this.#emailService.sendCancellationEmail(userEmailData);
		await this.#emailService.sendCancellationEmail(leaderEmailData);

		return { success: true };
	}
}
