import { Job } from "bullmq";
import { IBaseWorker } from "./types";
import { BookingRepository } from "@/repositories";
import { BookingStatus, CancellationSource } from "@/models/booking";

export class BookingTimeoutWorker implements IBaseWorker {
	public readonly queueName = "booking-timeout-task";
	public readonly concurrency = 5;
	readonly #bookingRepository: BookingRepository;

	constructor(bookingRepository: BookingRepository) {
		this.#bookingRepository = bookingRepository;
	}

	public async process(job: Job<{ bookingId: string }>): Promise<void> {
		const { bookingId } = job.data;
		console.log(`[BookingTimeoutWorker] Checking timeout for booking ${bookingId}`);

		const booking = await this.#bookingRepository.findById(bookingId);
		if (!booking) {
			console.log(`[BookingTimeoutWorker] Booking ${bookingId} not found.`);
			return;
		}

		if (booking.getStatus() === BookingStatus.PENDING) {
			console.log(`[BookingTimeoutWorker] Booking ${bookingId} is still PENDING. Cancelling...`);
			booking.cancel(CancellationSource.SYSTEM, "Booking timeout");
			await this.#bookingRepository.cancelWithTransaction(booking);
			console.log(`[BookingTimeoutWorker] Booking ${bookingId} and associated payments failed.`);
		} else {
			console.log(`[BookingTimeoutWorker] Booking ${bookingId} status is ${booking.getStatus()}. No timeout needed.`);
		}
	}
}
