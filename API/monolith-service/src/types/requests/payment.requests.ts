import type { Request } from "express";

export interface PayosWebhookData {
	orderCode: number;
	amount: number;
	description: string;
	status: string;
	checkoutResponseCode: string;
	paymentLinkId: string;
	reference: string;
	transactionDateTime: string;
	currency: string;
	paymentType: string;
	signature: string;
}

export interface PayosWebhookPayload {
	code: string;
	desc: string;
	data: PayosWebhookData;
	signature: string;
}

export type PayosWebhookRequest = Request<unknown, unknown, PayosWebhookPayload>;

export interface CreatePaymentLinkBody {
	bookingId: string;
	returnUrl: string;
	cancelUrl: string;
}

export type CreatePaymentLinkRequest = Request<unknown, unknown, CreatePaymentLinkBody>;
