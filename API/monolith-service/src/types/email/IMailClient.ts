import { SentMessageInfo } from "nodemailer/lib/smtp-transport";

/**
 * Interface cho Mail Client (SMTP, SES, Resend...)
 */
export interface IMailClient {
	/**
	 * @param to target email
	 * @param subject subject of the email
	 * @param message the message text (email body)
	 * @param html (optional) the message text, but in html version.
	 */
	send(to: string[] | string, subject: string, message: string, html?: string): Promise<SentMessageInfo>;
}
