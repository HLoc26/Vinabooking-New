import { SentMessageInfo } from "nodemailer/lib/smtp-transport";

/**
 * Implemented this for future integration of Amazon SES or Resend
 */

export interface IMailClient {
	/**
	 * @param to target email
	 * @param subject subject of the email
	 * @param message the message text (email body)
	 * @param html (optional) the message text, but in html version. If this is specified, the client will send html instead of message
	 */
	send(to: string[] | string, subject: string, message: string, html?: string): Promise<SentMessageInfo>;
}
