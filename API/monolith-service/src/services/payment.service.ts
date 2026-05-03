import { BookingRepository, PaymentRepository } from "@/repositories";
import { NotFoundError, BadRequestError } from "@/errors";
import { Prisma } from "@/generated/client";
import { PayosWebhookData } from "@/types/requests/payment.requests";
import PayosService from "./payos.service";

export default class PaymentService {
	readonly #paymentRepository: PaymentRepository;
	readonly #bookingRepository: BookingRepository;
	readonly #payosService: PayosService;

	constructor(paymentRepository: PaymentRepository, bookingRepository: BookingRepository, payosService: PayosService) {
		this.#paymentRepository = paymentRepository;
		this.#bookingRepository = bookingRepository;
		this.#payosService = payosService;
	}

	public async createPaymentLink(bookingId: string, returnUrl: string, cancelUrl: string) {
		const booking = await this.#bookingRepository.findById(bookingId);
		if (!booking) {
			throw new NotFoundError(`Booking with ID ${bookingId} not found`);
		}

		if (booking.status === "BOOKED" || booking.status === "COMPLETED") {
			throw new BadRequestError("Booking is already paid");
		}

		const orderCode = booking.referenceNo;
		const amount = Math.round(Number(booking.totalPrice));
		
		if (isNaN(amount) || amount <= 0) {
			throw new BadRequestError(`Invalid booking amount: ${booking.totalPrice}`);
		}

		// PayOS description is max 25 characters
		const description = `BK${orderCode}`.slice(0, 25);

		const paymentLinkRes = await this.#payosService.createPaymentLink({
			orderCode,
			amount,
			description,
			cancelUrl,
			returnUrl,
		});

		// Create a pending payment record
		await this.#paymentRepository.create({
			Booking: { connect: { id: bookingId } },
			amount: new Prisma.Decimal(amount),
			currency: "VND",
			transferContent: description,
			paymentLinkId: paymentLinkRes.paymentLinkId,
			status: "PENDING",
		});

		return paymentLinkRes;
	}

	public async verifyPaymentByBookingReference(referenceNo: number) {
		const booking = await this.#bookingRepository.findByReferenceNo(referenceNo);
		if (!booking) {
			throw new NotFoundError(`Booking with reference ${referenceNo} not found`);
		}

		if (booking.status === "BOOKED" || booking.status === "COMPLETED") {
			return {
				bookingId: booking.id,
				status: "ALREADY_PAID",
			};
		}

		try {
			const paymentInfo = await this.#payosService.getPaymentLinkInformation(referenceNo);

			if (paymentInfo.status === "PAID") {
				// PayOS getPaymentLinkInformation returns 'transactions' array
				const transactions = (paymentInfo as any).transactions;
				const lastTransaction = transactions && transactions.length > 0 ? transactions[transactions.length - 1] : null;
				
				if (lastTransaction) {
					return await this.processPayosPayment({
						orderCode: (paymentInfo as any).orderCode,
						amount: lastTransaction.amount,
						description: lastTransaction.description,
						reference: lastTransaction.reference,
						transactionDateTime: lastTransaction.transactionDateTime,
						currency: (paymentInfo as any).currency || "VND",
						paymentLinkId: (paymentInfo as any).id,
					} as unknown as PayosWebhookData, booking.id);
				}
			}

			return {
				bookingId: booking.id,
				status: paymentInfo.status,
			};
		} catch (error) {
			console.error("Verify Payment Error:", error);
			return {
				bookingId: booking.id,
				status: "NOT_FOUND",
			};
		}
	}

	public async processWebhook(payload: any) {
		const verifiedData = await this.#payosService.verifyPaymentWebhookData(payload);

		if (!verifiedData) {
			throw new BadRequestError("Invalid webhook signature");
		}

		const { orderCode, code } = verifiedData;

		if (code !== "00") {
			return { status: "NOT_PAID", orderCode, code };
		}

		const booking = await this.#bookingRepository.findByReferenceNo(orderCode);
		if (!booking) {
			throw new NotFoundError(`Booking with reference ${orderCode} not found`);
		}

		return await this.processPayosPayment(verifiedData as unknown as PayosWebhookData, booking.id);
	}

	private async processPayosPayment(data: PayosWebhookData, bookingId: string) {
		const transferReference = data.reference;

		// Check if already processed as COMPLETED
		const existing = await this.#paymentRepository.findByTransferReference(transferReference);
		if (existing && existing.status === "COMPLETED") {
			return {
				bookingId: existing.bookingId,
				transferId: existing.id,
				status: existing.status,
			};
		}

		// Look for the PENDING record created during link generation
		const pendingRecord = await this.#paymentRepository.findByPaymentLinkId(data.paymentLinkId);

		if (pendingRecord) {
			await this.#paymentRepository.update(pendingRecord.id, {
				transferReference,
				receivedAt: new Date(data.transactionDateTime),
				completedAt: new Date(),
				status: "COMPLETED",
			});
		} else {
			// Fallback if PENDING record was not found
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

		await this.#bookingRepository.confirm(bookingId);

		return {
			bookingId,
			transferId: pendingRecord?.id || "new-record",
			status: "COMPLETED",
		};
	}
}
