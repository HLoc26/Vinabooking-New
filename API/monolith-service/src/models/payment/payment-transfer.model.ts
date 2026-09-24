import { PaymentTransferStatus } from "./payment.enums";

export class PaymentTransfer {
	readonly #id: string;
	readonly #bookingId: string;
	#transferReference: string | null;
	readonly #amount: number;
	readonly #currency: string;
	readonly #transferContent: string;
	readonly #bankName: string | null;
	readonly #receiverAccount: string | null;
	readonly #paymentLinkId: string | null;
	#status: PaymentTransferStatus;
	#receivedAt: Date | null;
	#completedAt: Date | null;
	readonly #createdAt: Date;
	readonly #updatedAt: Date;

	constructor(builder: PaymentTransferBuilder) {
		this.#id = builder.id;
		this.#bookingId = builder.bookingId;
		this.#transferReference = builder.transferReference;
		this.#amount = builder.amount;
		this.#currency = builder.currency;
		this.#transferContent = builder.transferContent;
		this.#bankName = builder.bankName;
		this.#receiverAccount = builder.receiverAccount;
		this.#paymentLinkId = builder.paymentLinkId;
		this.#status = builder.status;
		this.#receivedAt = builder.receivedAt;
		this.#completedAt = builder.completedAt;
		this.#createdAt = builder.createdAt;
		this.#updatedAt = builder.updatedAt;
	}

	public getId(): string { return this.#id; }
	public getBookingId(): string { return this.#bookingId; }
	public getTransferReference(): string | null { return this.#transferReference; }
	public getAmount(): number { return this.#amount; }
	public getCurrency(): string { return this.#currency; }
	public getTransferContent(): string { return this.#transferContent; }
	public getBankName(): string | null { return this.#bankName; }
	public getReceiverAccount(): string | null { return this.#receiverAccount; }
	public getPaymentLinkId(): string | null { return this.#paymentLinkId; }
	public getStatus(): PaymentTransferStatus { return this.#status; }
	public getReceivedAt(): Date | null { return this.#receivedAt; }
	public getCompletedAt(): Date | null { return this.#completedAt; }
	public getCreatedAt(): Date { return this.#createdAt; }
	public getUpdatedAt(): Date { return this.#updatedAt; }

	public completePayment(transferReference: string, receivedAt: Date): void {
		if (this.#status === PaymentTransferStatus.COMPLETED) {
			return; // Idempotency
		}
		this.#status = PaymentTransferStatus.COMPLETED;
		this.#transferReference = transferReference;
		this.#receivedAt = receivedAt;
		this.#completedAt = new Date();
	}

	public markAsFailed(): void {
		if (this.#status === PaymentTransferStatus.PENDING) {
			this.#status = PaymentTransferStatus.FAILED;
		}
	}

	public dismiss(): void {
		if (this.#status === PaymentTransferStatus.PENDING) {
			this.#status = PaymentTransferStatus.DISMISSED;
		}
	}
}

export class PaymentTransferBuilder {
	public id!: string;
	public bookingId!: string;
	public transferReference: string | null = null;
	public amount!: number;
	public currency: string = "VND";
	public transferContent!: string;
	public bankName: string | null = null;
	public receiverAccount: string | null = null;
	public paymentLinkId: string | null = null;
	public status: PaymentTransferStatus = PaymentTransferStatus.PENDING;
	public receivedAt: Date | null = null;
	public completedAt: Date | null = null;
	public createdAt: Date = new Date();
	public updatedAt: Date = new Date();

	public setId(id: string): this { this.id = id; return this; }
	public setBookingId(bookingId: string): this { this.bookingId = bookingId; return this; }
	public setTransferReference(transferReference: string | null): this { this.transferReference = transferReference; return this; }
	public setAmount(amount: number): this { this.amount = amount; return this; }
	public setCurrency(currency: string): this { this.currency = currency; return this; }
	public setTransferContent(transferContent: string): this { this.transferContent = transferContent; return this; }
	public setBankName(bankName: string | null): this { this.bankName = bankName; return this; }
	public setReceiverAccount(receiverAccount: string | null): this { this.receiverAccount = receiverAccount; return this; }
	public setPaymentLinkId(paymentLinkId: string | null): this { this.paymentLinkId = paymentLinkId; return this; }
	public setStatus(status: PaymentTransferStatus): this { this.status = status; return this; }
	public setReceivedAt(receivedAt: Date | null): this { this.receivedAt = receivedAt; return this; }
	public setCompletedAt(completedAt: Date | null): this { this.completedAt = completedAt; return this; }
	public setCreatedAt(createdAt: Date): this { this.createdAt = createdAt; return this; }
	public setUpdatedAt(updatedAt: Date): this { this.updatedAt = updatedAt; return this; }

	public build(): PaymentTransfer {
		if (!this.id || !this.bookingId || this.amount === undefined || !this.transferContent) {
			throw new Error("Missing required fields for PaymentTransfer.");
		}
		return new PaymentTransfer(this);
	}
}
