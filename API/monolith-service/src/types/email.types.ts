import { Accommodation, EItemType } from "@/generated/client";
import { AccommodationFullInfo } from "@/dto/response/accommodation.dto";
import { SentMessageInfo } from "nodemailer";

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


export interface ConfirmationEmailData {
	to: string;
	accommodation: AccommodationFullInfo;
	checkIn: string;
	checkOut: string;

	guestName?: string;
	referenceNo?: number;
	roomType?: EItemType | string;
	guestCount?: number;
	nights?: number;
	specialRequest?: string;
	totalCharge?: string;
}

export interface CancellationEmailData {
	to: string;
	accommodation: Accommodation;
	guestName?: string;
	referenceNo?: number;
	roomType?: EItemType | string;
	nights?: number;
	cancellationReason?: string;
	cancelledBy?: string;
}
