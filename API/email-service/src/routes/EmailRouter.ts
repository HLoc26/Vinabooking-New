import { type Router, type Request, type Response } from "express";
import ResponseHelper from "../utils/ResponseHelper";
import EmailController from "../controllers/EmailController";
import { getRedisClient } from "../clients/RedisSingleton";

// Base route: /users
class EmailRouter {
	constructor(
		private emailController: EmailController,
		public router: Router
	) {
		this.registerRoutes();
	}

	private registerRoutes(): void {
		// health check
		this.router.get("/health", async (_: Request, res: Response) => {
			const redis = await getRedisClient();
			const ping = await redis.ping("Healthy");
			ResponseHelper.success(res, {
				email_service: "Healthy",
				redis: ping,
			});
		});

		this.router.post("/", async (req: Request, res: Response) => {
			return this.emailController.sendMail(req, res);
		});
	}
}

export default EmailRouter;
