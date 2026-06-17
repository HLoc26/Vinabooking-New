import type { Request, Response } from "express";
import { PaymentService } from "@/services";
import { PayosWebhookRequest, CreatePaymentLinkRequest } from "@/dto/request/payment.dto";
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
			// 1. Log the raw body for debugging
			console.log("PayOS Webhook Triggered:", JSON.stringify(req.body.data, null, 2));

			const orderCode = req.body.data?.orderCode;
			if (!orderCode) {
				return res.status(200).json({ success: false, error: "No orderCode" });
			}

			/**
			 * 2. Accurate Extraction (String Slicing)
			 * We convert to string and remove the last 4 digits.
			 * This avoids the Number.MAX_SAFE_INTEGER rounding bug.
			 */
			const orderCodeStr = String(orderCode);
			const originalReferenceNo = orderCodeStr.substring(0, orderCodeStr.length - 4);

			console.log(`Processing update for Booking Ref: ${originalReferenceNo}`);

			// 3. Delegate to service
			const result = await this.paymentService.processWebhook(req.body);

			// 4. Log the service result (fixes the 'result' is never read error)
			//how to boolean result is never read error
			console.log("Webhook processed successfully:", result?.success || "No status returned");

			return res.status(200).json({ success: true });
		} catch (err: unknown) {
			const e = err as Error;
			console.error("PayOS webhook failure:", e.message);

			// We return 200 so PayOS stops retrying, but success is false for our logs
			return res.status(200).json({ success: false, error: e.message });
		}
	}
}
