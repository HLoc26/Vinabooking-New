import { PrismaClient, Prisma, type PaymentTransfer } from "@/generated/client";

export type CreatePaymentTransferInput = Prisma.PaymentTransferCreateInput;
export type UpdatePaymentTransferInput = Prisma.PaymentTransferUpdateInput;

class PaymentRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	public async create(data: CreatePaymentTransferInput): Promise<PaymentTransfer> {
		return this.#prismaClient.paymentTransfer.create({ data });
	}

	public async findById(id: string): Promise<PaymentTransfer | null> {
		return this.#prismaClient.paymentTransfer.findUnique({ where: { id } });
	}
	public async deletePendingByBookingId(bookingId: string) {
		const result = await this.#prismaClient.paymentTransfer.deleteMany({
			where: {
				bookingId,
				status: "PENDING", // already scoped to pending only
			},
		});
		console.log(`Deleted ${result.count} pending records for booking ${bookingId}`);
		return result;
	}

	public async markAsFailedByBookingId(bookingId: string) {
		return this.#prismaClient.paymentTransfer.updateMany({
			where: { bookingId, status: "PENDING" },
			data: { status: "FAILED" }
		});
	}

	public async createPendingRecord(data: { bookingId: string; amount: number; description: string; paymentLinkId: string }) {
		return await this.#prismaClient.paymentTransfer.create({
			data: {
				Booking: { connect: { id: data.bookingId } },
				amount: data.amount, // Prisma handles the Decimal conversion if the schema matches
				currency: "VND",
				transferContent: data.description,
				paymentLinkId: data.paymentLinkId,
				status: "PENDING",
			},
		});
	}
	public async updateByPaymentLinkId(linkId: string, data: any) {
		return await this.#prismaClient.paymentTransfer.updateMany({
			where: { paymentLinkId: linkId },
			data: {
				status: "COMPLETED",
				transferReference: data.reference,
				receivedAt: new Date(data.transactionDateTime),
				completedAt: new Date(),
			},
		});
	}
	/**
	 * Find a payment transfer by its unique transaction reference.
	 * Used for idempotency to ensure a transaction is only processed once.
	 */
	public async findByTransferReference(transferReference: string): Promise<PaymentTransfer | null> {
		return this.#prismaClient.paymentTransfer.findUnique({ where: { transferReference } });
	}

	public async findByPaymentLinkId(paymentLinkId: string): Promise<PaymentTransfer | null> {
		return this.#prismaClient.paymentTransfer.findFirst({ where: { paymentLinkId } });
	}
	public async findLatestByBookingId(bookingId: string): Promise<PaymentTransfer | null> {
		return this.#prismaClient.paymentTransfer.findFirst({
			where: { bookingId },
			orderBy: { createdAt: "desc" },
		});
	}
	public async update(id: string, data: UpdatePaymentTransferInput): Promise<PaymentTransfer> {
		return this.#prismaClient.paymentTransfer.update({ where: { id }, data });
	}
}

export default PaymentRepository;
