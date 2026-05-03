import { Router, type Response } from "express";
import PaymentController from "@/controllers/payment.controller";

class PaymentRouter {
	constructor(
		public router: Router,
		private paymentController: PaymentController
	) {
		this.registerRoutes();
	}

	private registerRoutes() {
		this.router.post("/create", (req, res: Response) => this.paymentController.create(req, res));
		this.router.post("/webhook", (req, res: Response) => this.paymentController.processWebhook(req, res));
		this.router.get("/verify", (req, res: Response) => this.paymentController.verify(req, res));
	}
}

export default PaymentRouter;
