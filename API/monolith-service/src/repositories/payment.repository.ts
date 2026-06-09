import { PrismaClient } from "@/generated/client";
import { PaymentTransfer } from "@/models/payment";
import { PaymentMapper } from "@/mappers/payment.mapper";

class PaymentRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	public async save(paymentTransfer: PaymentTransfer): Promise<void> {
		const data = PaymentMapper.toPersistence(paymentTransfer);
		
		await this.#prismaClient.paymentTransfer.upsert({
			where: { id: paymentTransfer.getId() },
			create: data,
			update: PaymentMapper.toPersistenceUpdate(paymentTransfer),
		});
	}

	public async findById(id: string): Promise<PaymentTransfer | null> {
		const result = await this.#prismaClient.paymentTransfer.findUnique({ where: { id } });
		return result ? PaymentMapper.toDomain(result) : null;
	}

	public async deletePendingByBookingId(bookingId: string): Promise<void> {
		await this.#prismaClient.paymentTransfer.deleteMany({
			where: {
				bookingId,
				status: "PENDING",
			},
		});
	}

	public async findByTransferReference(transferReference: string): Promise<PaymentTransfer | null> {
		const result = await this.#prismaClient.paymentTransfer.findUnique({ where: { transferReference } });
		return result ? PaymentMapper.toDomain(result) : null;
	}

	public async findByPaymentLinkId(paymentLinkId: string): Promise<PaymentTransfer | null> {
		const result = await this.#prismaClient.paymentTransfer.findFirst({ where: { paymentLinkId } });
		return result ? PaymentMapper.toDomain(result) : null;
	}

	public async findLatestByBookingId(bookingId: string): Promise<PaymentTransfer | null> {
		const result = await this.#prismaClient.paymentTransfer.findFirst({
			where: { bookingId },
			orderBy: { createdAt: "desc" },
		});
		return result ? PaymentMapper.toDomain(result) : null;
	}
}

export default PaymentRepository;
