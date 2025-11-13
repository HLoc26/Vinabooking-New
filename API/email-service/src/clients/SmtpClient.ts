import nodemailer from "nodemailer";
import { IMailClient } from "../types/IMailClient";

class SmtpClient implements IMailClient {
	private transporter;

	constructor() {
		if (!process.env["GMAIL_APP_USER"] || !process.env["GMAIL_APP_PASSWORD"]) {
			throw new Error("Missing Gmail credentials in environment variables.");
		}

		this.transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env["GMAIL_APP_USER"],
				pass: process.env["GMAIL_APP_PASSWORD"],
			},
		});
	}

	public async send(to: string[] | string, subject: string, message: string, html?: string) {
		try {
			const info = await this.transporter.sendMail({
				from: `"Vinabooking" <${process.env["GMAIL_APP_USER"]}>`,
				to,
				subject,
				text: message,
				html,
			});
			console.log("Email sent:", info.response);
			return info;
		} catch (err) {
			console.error("Error sending email:", err);
			throw err;
		}
	}
}

export default SmtpClient;
