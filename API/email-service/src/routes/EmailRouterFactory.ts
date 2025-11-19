import { Router } from "express";
import EmailRouter from "./EmailRouter";
import EmailController from "../controllers/EmailController";
import SmtpClient from "../clients/SmtpClient";

class EmailRouterFactory {
	public static createEmailRouter() {
		const router = Router();
		const smtpClient = new SmtpClient();
		const emailController = new EmailController(smtpClient);
		return new EmailRouter(emailController, router).router;
	}
}

export default EmailRouterFactory;
