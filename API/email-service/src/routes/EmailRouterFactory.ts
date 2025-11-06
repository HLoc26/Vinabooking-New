import { Router } from "express";
import EmailRouter from "./EmailRouter";
import EmailController from "../controllers/EmailController";

class EmailRouterFactory {
    public static createEmailRouter() {
        const router = Router();
        const emailController = new EmailController();
        return new EmailRouter(emailController, router).router;
    }
}

export default EmailRouterFactory;
