import { BookingRepository, PaymentRepository } from "@/repositories";
import { NotFoundError, BadRequestError } from "@/errors";
import { Prisma } from "@/generated/client";
import { PayosWebhookData } from "@/types/requests/payment.requests";
import PayosService from "./payos.service";
import BookingService from "./booking.service";

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
		if (latest && latest.status === "PENDING") {
			await this.#paymentRepository.deletePendingByBookingId(bookingId);
		}
		const booking = await this.#bookingRepository.findById(bookingId);
		if (!booking) {
			throw new NotFoundError(`Booking with ID ${bookingId} not found`);
		}

		if (booking.status === "BOOKED" || booking.status === "COMPLETED") {
			throw new BadRequestError("Booking is already paid");
		}

		// 2. Logic: Prepare PayOS-specific data
		const attemptSuffix = Math.floor(1000 + Math.random() * 9000);
		const orderCode = Number(`${booking.referenceNo}${attemptSuffix}`);
		const amount = Math.round(Number(booking.totalPrice));

		if (isNaN(amount) || amount <= 0) {
			throw new BadRequestError(`Invalid booking amount: ${booking.totalPrice}`);
		}

		const description = `BK${booking.referenceNo}`.slice(0, 25);

		// 3. Orchestration: Call External Provider
		const paymentLinkRes = await this.#payosService.createPaymentLink({
			orderCode,
			amount,
			description,
			cancelUrl,
			returnUrl,
		});

		// 4. Logic: Save state via Repo (Passing plain objects)
		await this.#paymentRepository.createPendingRecord({
			bookingId,
			amount,
			description,
			paymentLinkId: paymentLinkRes.paymentLinkId,
		});

		return paymentLinkRes;
	}
	public async verifyPaymentByBookingReference(referenceNo: number) {
		const booking = await this.#bookingRepository.findByReferenceNo(referenceNo);
		if (!booking) {
			throw new NotFoundError(`Booking with reference ${referenceNo} not found`);
		}

		if (booking.status === "BOOKED" || booking.status === "COMPLETED") {
			return { bookingId: booking.id, status: "ALREADY_PAID" };
		}

		try {
			// Fix: We can't search PayOS by referenceNo directly anymore since we mutated the orderCode.
			// Retrieve the specific PayOS link ID from our database instead.
			const latestPayment = await this.#paymentRepository.findLatestByBookingId(booking.id);

			if (!latestPayment || !latestPayment.paymentLinkId) {
				return { bookingId: booking.id, status: "NOT_FOUND" };
			}

			const paymentInfo = await this.#payosService.getPaymentLinkInformation(latestPayment.paymentLinkId);

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
						booking.id
					);
				}
			}

			return { bookingId: booking.id, status: paymentInfo.status };
		} catch (error) {
			console.error("Verify Payment Error:", error);
			return { bookingId: booking.id, status: "NOT_FOUND" };
		}
	}

	// services/payment.service.ts
	public async processWebhook(payload: any) {
		const verifiedData = await this.#payosService.verifyPaymentWebhookData(payload);

		if (!verifiedData || verifiedData.code !== "00") {
			return { success: false };
		}

		const orderCodeStr = verifiedData.orderCode.toString();
		const originalRefNo = Number(orderCodeStr.substring(0, orderCodeStr.length - 4));

		const booking = await this.#bookingRepository.findByReferenceNo(originalRefNo);
		if (!booking) throw new Error(`Booking not found for referenceNo: ${originalRefNo}`);

		if (booking.status === "BOOKED" || booking.status === "COMPLETED") {
			console.log(`[PaymentService] Booking ${booking.id} already confirmed, skipping.`);
			return { success: true };
		}

		await this.#paymentRepository.updateByPaymentLinkId(verifiedData.paymentLinkId, verifiedData);

		return { success: true };
	}

	private async processPayosPayment(data: PayosWebhookData, bookingId: string) {
		// ... (This function remains entirely unchanged)
		const transferReference = data.reference;

		const existing = await this.#paymentRepository.findByTransferReference(transferReference);
		if (existing && existing.status === "COMPLETED") {
			return {
				bookingId: existing.bookingId,
				transferId: existing.id,
				status: existing.status,
			};
		}

		const pendingRecord = await this.#paymentRepository.findByPaymentLinkId(data.paymentLinkId);

		if (pendingRecord) {
			await this.#paymentRepository.update(pendingRecord.id, {
				transferReference,
				receivedAt: new Date(data.transactionDateTime),
				completedAt: new Date(),
				status: "COMPLETED",
			});
		} else {
			await this.#paymentRepository.create({
				Booking: { connect: { id: bookingId } },
				transferReference,
				amount: new Prisma.Decimal(data.amount),
				currency: data.currency || "VND",
				transferContent: data.description,
				paymentLinkId: data.paymentLinkId,
				receivedAt: new Date(data.transactionDateTime),
				completedAt: new Date(),
				status: "COMPLETED",
			});
		}

		await this.#bookingService.confirmBooking(bookingId);

		return {
			bookingId,
			transferId: pendingRecord?.id || "new-record",
			status: "COMPLETED",
		};
	}
}
