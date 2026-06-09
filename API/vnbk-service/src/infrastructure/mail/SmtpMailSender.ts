import { singleton } from "tsyringe";
import nodemailer, { type Transporter } from "nodemailer";
import { AppConfig } from "@/config/AppConfig";
import type { IMailSender, MailMessage } from "@/infrastructure/mail/IMailSender";

/** Gmail/SMTP IMailSender. Transporter is built lazily on first send. */
@singleton()
export class SmtpMailSender implements IMailSender {
	private transporter?: Transporter;
	private fromUser?: string;

	constructor(private readonly config: AppConfig) {}

	private getTransporter(): Transporter {
		if (!this.transporter) {
			this.fromUser = this.config.getRequired("GMAIL_APP_USER");
			this.transporter = nodemailer.createTransport({
				service: "gmail",
				auth: {
					user: this.fromUser,
					pass: this.config.getRequired("GMAIL_APP_PASSWORD"),
				},
			});
		}
		return this.transporter;
	}

	public async send(message: MailMessage): Promise<void> {
		const transporter = this.getTransporter();
		const info = await transporter.sendMail({
			from: `"Vinabooking" <${this.fromUser}>`,
			to: message.to,
			subject: message.subject,
			text: message.text,
			html: message.html,
		});
		console.log(`[SmtpMailSender] Email sent to ${String(message.to)} | ID: ${info.messageId}`);
	}
}
