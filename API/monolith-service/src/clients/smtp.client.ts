import nodemailer, { Transporter } from "nodemailer";
import { SentMessageInfo } from "nodemailer/lib/smtp-transport";
import EnvironmentNotSetError from "../errors/EnvironmentNotSetError";
import { IMailClient } from "@/types/email.types";

class SmtpClient implements IMailClient {
	static #instance: SmtpClient;

	public static readonly user = process.env["GMAIL_APP_USER"];
	public static readonly pass = process.env["GMAIL_APP_PASSWORD"];

	private readonly transporter: Transporter;

	private constructor() {
		this.transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: SmtpClient.user,
				pass: SmtpClient.pass,
			},
		});
	}

	public static getInstance(): SmtpClient {
		if (!SmtpClient.user || !SmtpClient.pass) {
			throw new EnvironmentNotSetError("Missing .env GMAIL_APP_USER or GMAIL_APP_PASSWORD");
		}

		if (!SmtpClient.#instance) {
			SmtpClient.#instance = new SmtpClient();
		}

		return SmtpClient.#instance;
	}

	public async send(to: string[] | string, subject: string, message: string, html?: string): Promise<SentMessageInfo> {
		try {
			const info = await this.transporter.sendMail({
				from: `"Vinabooking" <${SmtpClient.user}>`,
				to,
				subject,
				text: message,
				html,
			});
			console.log(`[SmtpClient] Email sent to: ${to} | ID: ${info.messageId}`);
			return info;
		} catch (err) {
			console.error("[SmtpClient] Error sending email:", err);
			throw err;
		}
	}
}

export default SmtpClient;
