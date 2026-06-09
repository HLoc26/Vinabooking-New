/** A transport-level email message. Templating lives in the consuming module. */
export interface MailMessage {
	to: string | string[];
	subject: string;
	text?: string;
	html?: string;
}

/** Port for sending email. */
export interface IMailSender {
	send(message: MailMessage): Promise<void>;
}
