import { BookingRepository, PaymentRepository } from "@/repositories";
import { NotFoundError, BadRequestError } from "@/errors";
import { PayosWebhookData } from "@/types/requests/payment.requests";
import PayosService from "./payos.service";
import BookingService from "./booking.service";
import { BookingStatus } from "@/models/booking";
import { PaymentTransferBuilder, PaymentTransferStatus } from "@/models/payment";
import { randomUUID } from "crypto";

export default class PaymentService {
	readonly #paymentRepository: PaymentRepository;
	readonly #bookingRepository: BookingRepository;
	readonly #payosService: PayosService;
	readonly #bookingService: BookingService;

	constructor(paymentRepository: PaymentRepository, bookingRepository: BookingRepository, payosService: PayosService, bookingService: BookingService) {
		this.#paymentRepository = paymentRepository;
		this.#bookingRepository = bookingRepository;
		this.#payosService = payosService;
		this.#bookingService = bookingService;
	}

	public async createPaymentLink(bookingId: string, returnUrl: string, cancelUrl: string) {
		// 1. Logic: Cleanup old attempts via Repo
		const latest = await this.#paymentRepository.findLatestByBookingId(bookingId);
		if (latest && latest.getStatus() === PaymentTransferStatus.PENDING) {
			await this.#paymentRepository.deletePendingByBookingId(bookingId);
		}
		const booking = await this.#bookingRepository.findById(bookingId);
		if (!booking) {
			throw new NotFoundError(`Booking with ID ${bookingId} not found`);
		}

		if (booking.getStatus() === BookingStatus.BOOKED || booking.getStatus() === BookingStatus.COMPLETED) {
			throw new BadRequestError("Booking is already paid");
		}

		// 2. Logic: Prepare PayOS-specific data
		const attemptSuffix = Math.floor(1000 + Math.random() * 9000);
		const orderCode = Number(`${booking.getReferenceNo()}${attemptSuffix}`);
		const amount = Math.round(Number(booking.getTotalPrice()));

		if (isNaN(amount) || amount <= 0) {
			throw new BadRequestError(`Invalid booking amount: ${booking.getTotalPrice()}`);
		}

		const description = `BK${booking.getReferenceNo()}`.slice(0, 25);

		// 3. Orchestration: Call External Provider
		const paymentLinkRes = await this.#payosService.createPaymentLink({
			orderCode,
			amount,
			description,
			cancelUrl,
			returnUrl,
		});

		// 4. Logic: Save state via Repo using Domain Model
		const payment = new PaymentTransferBuilder()
			.setId(randomUUID())
			.setBookingId(bookingId)
			.setAmount(amount)
			.setTransferContent(description)
			.setPaymentLinkId(paymentLinkRes.paymentLinkId)
			.build();
			
		await this.#paymentRepository.save(payment);

		return paymentLinkRes;
	}

	public async verifyPaymentByBookingReference(referenceNo: number) {
		const booking = await this.#bookingRepository.findByReferenceNo(referenceNo);
		if (!booking) {
			throw new NotFoundError(`Booking with reference ${referenceNo} not found`);
		}

		if (booking.getStatus() === BookingStatus.BOOKED || booking.getStatus() === BookingStatus.COMPLETED) {
			return { bookingId: booking.getId(), status: "ALREADY_PAID" };
		}

		try {
			const latestPayment = await this.#paymentRepository.findLatestByBookingId(booking.getId());

			if (!latestPayment || !latestPayment.getPaymentLinkId()) {
				return { bookingId: booking.getId(), status: "NOT_FOUND" };
			}

			const paymentLinkId = latestPayment.getPaymentLinkId();
			if (!paymentLinkId) {
				return { bookingId: booking.getId(), status: "NOT_FOUND" };
			}

			const paymentInfo = await this.#payosService.getPaymentLinkInformation(paymentLinkId);

			if (paymentInfo.status === "PAID") {
				const transactions = (paymentInfo as any).transactions;
				const lastTransaction = transactions && transactions.length > 0 ? transactions[transactions.length - 1] : null;

				if (lastTransaction) {
					return await this.processPayosPayment(
						{
							orderCode: (paymentInfo as any).orderCode,
							amount: lastTransaction.amount,
							description: lastTransaction.description,
							reference: lastTransaction.reference,
							transactionDateTime: lastTransaction.transactionDateTime,
							currency: (paymentInfo as any).currency || "VND",
							paymentLinkId: (paymentInfo as any).id,
						} as unknown as PayosWebhookData,
						booking.getId()
					);
				}
			}

			return { bookingId: booking.getId(), status: paymentInfo.status };
		} catch (error) {
			console.error("Verify Payment Error:", error);
			return { bookingId: booking.getId(), status: "NOT_FOUND" };
		}
	}

	public async processWebhook(payload: any) {
		const verifiedData = await this.#payosService.verifyPaymentWebhookData(payload);

		if (!verifiedData || verifiedData.code !== "00") {
			return { success: false };
		}

		const orderCodeStr = verifiedData.orderCode.toString();
		const originalRefNo = Number(orderCodeStr.substring(0, orderCodeStr.length - 4));

		const booking = await this.#bookingRepository.findByReferenceNo(originalRefNo);
		if (!booking) throw new Error(`Booking not found for referenceNo: ${originalRefNo}`);

		if (booking.getStatus() === BookingStatus.BOOKED || booking.getStatus() === BookingStatus.COMPLETED) {
			console.log(`[PaymentService] Booking ${booking.getId()} already confirmed, skipping.`);
			return { success: true };
		}

		const payment = await this.#paymentRepository.findByPaymentLinkId(verifiedData.paymentLinkId);
		if (payment) {
			payment.completePayment(verifiedData.reference, new Date(verifiedData.transactionDateTime));
			await this.#paymentRepository.save(payment);
		}

		return { success: true };
	}

	private async processPayosPayment(data: PayosWebhookData, bookingId: string) {
		const transferReference = data.reference;

		const existing = await this.#paymentRepository.findByTransferReference(transferReference);
		if (existing && existing.getStatus() === PaymentTransferStatus.COMPLETED) {
			return {
				bookingId: existing.getBookingId(),
				transferId: existing.getId(),
				status: existing.getStatus(),
			};
		}

		let payment = await this.#paymentRepository.findByPaymentLinkId(data.paymentLinkId);

		if (payment) {
			payment.completePayment(transferReference, new Date(data.transactionDateTime));
		} else {
			payment = new PaymentTransferBuilder()
				.setId(randomUUID())
				.setBookingId(bookingId)
				.setAmount(data.amount)
				.setTransferContent(data.description)
				.setPaymentLinkId(data.paymentLinkId)
				.build();
			payment.completePayment(transferReference, new Date(data.transactionDateTime));
		}

		await this.#paymentRepository.save(payment);

		await this.#bookingService.confirmBooking(bookingId);

		return {
			bookingId,
			transferId: payment.getId(),
			status: "COMPLETED",
		};
	}
}
