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

	public async update(id: string, data: UpdatePaymentTransferInput): Promise<PaymentTransfer> {
		return this.#prismaClient.paymentTransfer.update({ where: { id }, data });
	}
}

export default PaymentRepository;
