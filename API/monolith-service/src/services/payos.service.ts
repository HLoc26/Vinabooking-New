import { PayOS } from "@payos/node";

export interface CreatePaymentLinkRequest {
	orderCode: number;
	amount: number;
	description: string;
	cancelUrl: string;
	returnUrl: string;
}

export default class PayosService {
	private readonly payos: PayOS;

	constructor(clientId: string, apiKey: string, checksumKey: string) {
		this.payos = new PayOS({ clientId, apiKey, checksumKey });
	}

	public async createPaymentLink(request: CreatePaymentLinkRequest) {
		try {
			const paymentLinkRes = await this.payos.paymentRequests.create(request);
			return paymentLinkRes;
		} catch (error) {
			console.error("PayOS Create Payment Link Error:", error);
			throw error;
		}
	}

	public verifyPaymentWebhookData(webhookBody: any) {
		try {
			return this.payos.webhooks.verify(webhookBody);
		} catch (error) {
			console.error("PayOS Webhook Verification Error:", error);
			throw error;
		}
	}

	public async getPaymentLinkInformation(orderId: number | string) {
		try {
			if (typeof orderId === "number") {
				return await this.payos.paymentRequests.get(orderId);
			}
			return await this.payos.paymentRequests.get(orderId);
		} catch (error) {
			console.error("PayOS Get Payment Link Error:", error);
			throw error;
		}
	}

	public async cancelPaymentLink(orderId: number | string, cancellationReason?: string) {
		try {
			if (typeof orderId === "number") {
				return await this.payos.paymentRequests.cancel(orderId, cancellationReason);
			}
			return await this.payos.paymentRequests.cancel(orderId, cancellationReason);
		} catch (error) {
			console.error("PayOS Cancel Payment Link Error:", error);
			throw error;
		}
	}
}
