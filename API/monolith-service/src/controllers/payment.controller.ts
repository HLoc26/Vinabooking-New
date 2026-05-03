import type { Request, Response } from "express";
import { PaymentService } from "@/services";
import { PayosWebhookRequest, CreatePaymentLinkRequest } from "@/types/requests/payment.requests";
import ResponseHelper from "@/utils/response";

/**
 * Payment controller handling PayOS integration.
 */
export default class PaymentController {
	constructor(private readonly paymentService: PaymentService) {}

	public async create(req: CreatePaymentLinkRequest, res: Response) {
		try {
			const { bookingId, returnUrl, cancelUrl } = req.body;
			if (!bookingId) {
				return ResponseHelper.error(res, "Missing bookingId in request body");
			}

			const result = await this.paymentService.createPaymentLink(bookingId, returnUrl, cancelUrl);
			return ResponseHelper.success(res, result);
		} catch (err: unknown) {
			const e = err as Error;
			return ResponseHelper.error(res, e.message);
		}
	}

	public async verify(req: Request, res: Response) {
		try {
			const { referenceNo } = req.query;
			if (!referenceNo) {
				return ResponseHelper.error(res, "Missing referenceNo query parameter");
			}

			const parsed = parseInt(String(referenceNo), 10);
			if (isNaN(parsed)) {
				return ResponseHelper.error(res, "Invalid referenceNo format");
			}

			const result = await this.paymentService.verifyPaymentByBookingReference(parsed);
			return ResponseHelper.success(res, result);
		} catch (err: unknown) {
			const e = err as Error;
			return ResponseHelper.error(res, e.message);
		}
	}

	public async processWebhook(req: PayosWebhookRequest, res: Response) {
		try {
			console.log("PayOS webhook received:", JSON.stringify(req.body, null, 2));

			const result = await this.paymentService.processWebhook(req.body);

			return res.status(200).json({ success: true, data: result });
		} catch (err: unknown) {
			const e = err as Error;
			console.error("PayOS webhook error:", e.message);
			return res.status(200).json({ success: false, error: e.message });
		}
	}
}
