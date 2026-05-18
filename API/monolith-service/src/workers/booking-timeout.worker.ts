import { Job } from "bullmq";
import { IBaseWorker } from "./types";
import { BookingRepository, PaymentRepository } from "@/repositories";

export class BookingTimeoutWorker implements IBaseWorker {
	public readonly queueName = "booking-timeout-task";
	public readonly concurrency = 5;
	readonly #bookingRepository: BookingRepository;
	readonly #paymentRepository: PaymentRepository;

	constructor(bookingRepository: BookingRepository, paymentRepository: PaymentRepository) {
		this.#bookingRepository = bookingRepository;
		this.#paymentRepository = paymentRepository;
	}

	public async process(job: Job<{ bookingId: string }>): Promise<void> {
		const { bookingId } = job.data;
		console.log(`[BookingTimeoutWorker] Checking timeout for booking ${bookingId}`);

		const booking = await this.#bookingRepository.findById(bookingId);
		if (!booking) {
			console.log(`[BookingTimeoutWorker] Booking ${bookingId} not found.`);
			return;
		}

		if (booking.status === "PENDING") {
			console.log(`[BookingTimeoutWorker] Booking ${bookingId} is still PENDING. Cancelling...`);
			await this.#bookingRepository.cancel(bookingId);
			await this.#paymentRepository.markAsFailedByBookingId(bookingId);
			console.log(`[BookingTimeoutWorker] Booking ${bookingId} and associated payments failed.`);
		} else {
			console.log(`[BookingTimeoutWorker] Booking ${bookingId} status is ${booking.status}. No timeout needed.`);
		}
	}
}
