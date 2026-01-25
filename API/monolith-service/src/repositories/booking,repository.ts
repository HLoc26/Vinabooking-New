import { PrismaClient } from "@generated/client";
import type { Booking } from "@generated/browser";
import type { CreateBookingInput } from "../types/Bookings";
import type { BookingWithDetails } from "../types/dtos/get-booking.dto";

class BookingRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	// ---------- findById overloads ----------
	public async findById(id: string): Promise<Booking | null>;
	public async findById(id: string, withDetails: true): Promise<BookingWithDetails | null>;
	public async findById(id: string, withDetails: false): Promise<Booking | null>;
	public async findById(id: string, withDetails: boolean = false): Promise<Booking | BookingWithDetails | null> {
		const queryOptions = {
			where: { id },
			include: {},
		};

		if (withDetails) {
			queryOptions.include = { details: true };
		}

		return await this.#prismaClient.booking.findUnique(queryOptions);
	}

	// ---------- findByUserId overloads ----------
	public async findByUserId(userId: string): Promise<Booking[]>;
	public async findByUserId(userId: string, withDetails: true): Promise<BookingWithDetails[]>;
	public async findByUserId(userId: string, withDetails: false): Promise<Booking[]>;
	public async findByUserId(userId: string, withDetails: boolean = false): Promise<Booking[] | BookingWithDetails[]> {
		const queryOptions = {
			where: { userId },
			include: {},
		};

		if (withDetails) {
			queryOptions.include = { details: true };
		}

		return await this.#prismaClient.booking.findMany(queryOptions);
	}

	// ---------- findByRoomId (always includes details) ----------
	public async findByRoomId(roomId: string): Promise<BookingWithDetails[]> {
		return await this.#prismaClient.booking.findMany({
			where: {
				details: {
					some: {
						itemId: roomId,
						itemType: "ROOM",
					},
				},
			},
			include: { details: true },
		});
	}

	// ---------- create ----------
	public async createBooking(data: CreateBookingInput): Promise<BookingWithDetails> {
		return await this.#prismaClient.booking.create({
			data,
			include: { details: true },
		});
	}

	// ---------- business logic ----------
	public async countBookedRooms(roomIds: string[], startDate: Date, endDate: Date): Promise<Record<string, number>> {
		const counts: Record<string, number> = {};

		for (const roomId of roomIds) {
			const details = await this.#prismaClient.bookingDetail.findMany({
				where: {
					itemId: roomId,
					itemType: "ROOM",
					Booking: {
						status: "BOOKED",
						startDate: { lte: endDate },
						endDate: { gte: startDate },
					},
				},
				select: { count: true },
			});

			counts[roomId] = details.reduce((sum, d) => sum + d.count, 0);
		}

		return counts;
	}

	// ---------- status updates ----------
	public async confirmBooking(id: string): Promise<BookingWithDetails> {
		return await this.#prismaClient.booking.update({
			where: { id },
			data: { status: "BOOKED" },
			include: { details: true },
		});
	}

	public async cancelBooking(id: string): Promise<BookingWithDetails> {
		return await this.#prismaClient.booking.update({
			where: { id },
			data: { status: "CANCELLED" },
			include: { details: true },
		});
	}
}

export default BookingRepository;
