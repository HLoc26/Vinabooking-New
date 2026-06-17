import { PaymentTransfer as PrismaPaymentTransfer, Prisma } from "@/generated/client";
import { PaymentTransfer, PaymentTransferBuilder, PaymentTransferStatus } from "@/models/payment";

export class PaymentMapper {
	public static toDomain(prismaPayment: PrismaPaymentTransfer): PaymentTransfer {
		const builder = new PaymentTransferBuilder()
			.setId(prismaPayment.id)
			.setBookingId(prismaPayment.bookingId)
			.setTransferReference(prismaPayment.transferReference)
			.setAmount(prismaPayment.amount.toNumber())
			.setCurrency(prismaPayment.currency)
			.setTransferContent(prismaPayment.transferContent)
			.setBankName(prismaPayment.bankName)
			.setReceiverAccount(prismaPayment.receiverAccount)
			.setPaymentLinkId(prismaPayment.paymentLinkId)
			.setStatus(prismaPayment.status as PaymentTransferStatus)
			.setReceivedAt(prismaPayment.receivedAt)
			.setCompletedAt(prismaPayment.completedAt)
			.setCreatedAt(prismaPayment.createdAt)
			.setUpdatedAt(prismaPayment.updatedAt);

		return builder.build();
	}

	public static toPersistence(domainModel: PaymentTransfer): Prisma.PaymentTransferCreateInput {
		return {
			id: domainModel.getId(),
			Booking: { connect: { id: domainModel.getBookingId() } },
			transferReference: domainModel.getTransferReference(),
			amount: new Prisma.Decimal(domainModel.getAmount()),
			currency: domainModel.getCurrency(),
			transferContent: domainModel.getTransferContent(),
			bankName: domainModel.getBankName(),
			receiverAccount: domainModel.getReceiverAccount(),
			paymentLinkId: domainModel.getPaymentLinkId(),
			status: domainModel.getStatus(),
			receivedAt: domainModel.getReceivedAt(),
			completedAt: domainModel.getCompletedAt(),
			createdAt: domainModel.getCreatedAt(),
			updatedAt: domainModel.getUpdatedAt(),
		};
	}

	public static toPersistenceUpdate(domainModel: PaymentTransfer): Prisma.PaymentTransferUpdateInput {
		return {
			transferReference: domainModel.getTransferReference(),
			amount: new Prisma.Decimal(domainModel.getAmount()),
			currency: domainModel.getCurrency(),
			transferContent: domainModel.getTransferContent(),
			bankName: domainModel.getBankName(),
			receiverAccount: domainModel.getReceiverAccount(),
			paymentLinkId: domainModel.getPaymentLinkId(),
			status: domainModel.getStatus(),
			receivedAt: domainModel.getReceivedAt(),
			completedAt: domainModel.getCompletedAt(),
			updatedAt: domainModel.getUpdatedAt(),
		};
	}
}
