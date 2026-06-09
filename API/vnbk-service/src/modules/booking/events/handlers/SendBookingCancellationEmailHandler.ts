import { inject, injectable } from "tsyringe";
import type { IDomainEventHandler } from "@/shared/events/IDomainEventHandler";
import type { BookingCancelledEvent } from "@/modules/booking/events/BookingCancelledEvent";
import { ACCOMMODATION_SERVICE, type IAccommodationService, type AccommodationResponse } from "@/modules/accommodation";
import { USER_SERVICE, type IUserService } from "@/modules/user";
import { ECancellationSource } from "@/modules/booking/enums/ECancellationSource";
import { MAIL_SENDER } from "@/infrastructure/infrastructure.tokens";
import type { IMailSender } from "@/infrastructure/mail/IMailSender";

/**
 * Cross-module side effect of a cancellation: assemble + send the cancellation
 * email. Subscribed to BookingCancelledEvent in BookingModule. Resolves the
 * owning accommodation + guest, then emails the guest and — if different — the
 * leader. The booking service never touches email; this handler owns the
 * templating (ported from the monolith).
 */
@injectable()
export class SendBookingCancellationEmailHandler implements IDomainEventHandler<BookingCancelledEvent> {
	constructor(
		@inject(ACCOMMODATION_SERVICE) private readonly accommodationService: IAccommodationService,
		@inject(USER_SERVICE) private readonly userService: IUserService,
		@inject(MAIL_SENDER) private readonly mailSender: IMailSender
	) {}

	public async handle(event: BookingCancelledEvent): Promise<void> {
		const accommodation = await this.accommodationService.getAccommodationByRoomId(event.roomId);
		const user = await this.userService.getById(event.userId);

		const subject = "Booking Cancellation";
		const cancelledBy = this.describeSource(event.source);

		await this.mailSender.send({
			to: user.email,
			subject,
			html: this.buildHtml(accommodation, {
				guestName: user.name,
				referenceNo: event.referenceNo,
				roomType: event.itemType,
				nights: event.nights,
				cancellationReason: event.note ?? undefined,
				cancelledBy,
			}),
		});

		if (event.leaderEmail && event.leaderEmail !== user.email) {
			await this.mailSender.send({
				to: event.leaderEmail,
				subject,
				html: this.buildHtml(accommodation, {
					guestName: event.leaderName ?? "Guest",
					referenceNo: event.referenceNo,
					roomType: event.itemType,
					nights: event.nights,
					cancellationReason: event.note ?? undefined,
					cancelledBy,
				}),
			});
		}
	}

	private describeSource(source: ECancellationSource | null): string | undefined {
		if (source === ECancellationSource.OWNER) return "the host";
		if (source === ECancellationSource.TRAVELLER) return "the traveller";
		return undefined;
	}

	private escapeHtml(value: string): string {
		return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
	}

	private buildHtml(
		accommodation: AccommodationResponse,
		data: {
			guestName: string;
			referenceNo: number;
			roomType: string;
			nights: number;
			cancellationReason?: string;
			cancelledBy?: string;
		}
	): string {
		const name = accommodation.name || "Property";
		const safeReason = data.cancellationReason ? this.escapeHtml(data.cancellationReason) : "";

		return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>Booking Cancellation</title>
		</head>
		<body style="margin:0; padding:0; background-color:#f7f5f2; font-family: Arial, sans-serif;">
			<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f5f2; padding:20px 0;">
				<tr>
					<td align="center">
						<table role="presentation" width="650" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:10px; padding:22px 28px; box-shadow:0 6px 18px rgba(0,0,0,0.06);">
							<tr>
								<td style="padding-bottom:16px;">
									<h1 style="margin:0; font-size:24px; color:#1f2933;">Your booking has been cancelled</h1>
									<p style="margin:8px 0 0; color:#565a5c;">Hi <strong>${data.guestName}</strong>, your reservation has been successfully cancelled.</p>
								</td>
							</tr>
							<tr>
								<td style="padding-bottom:18px;">
									<div style="background:#faf8f6; padding:16px; border-radius:8px; border:1px solid #efe9e3;">
										<h2 style="margin:0; font-size:18px; color:#2b2b2b;">${name}</h2>
										<p style="margin:6px 0 0; color:#6b6b6b;">Reference No: <strong>${data.referenceNo}</strong></p>
										<p style="margin:6px 0 0; color:#6b6b6b;">Room type: <strong>${data.roomType}</strong></p>
										<p style="margin:6px 0 0; color:#6b6b6b;">Nights: <strong>${data.nights}</strong></p>
									</div>
								</td>
							</tr>
							${
								data.cancellationReason
									? `<tr><td style="padding-bottom:18px;"><div style="background:#fff7ed; padding:16px; border-radius:8px; border:1px solid #fed7aa;"><p style="margin:0 0 6px; color:#9a3412; font-weight:700;">Cancellation reason${data.cancelledBy ? ` from ${data.cancelledBy}` : ""}</p><p style="margin:0; color:#431407; line-height:1.5;">${safeReason}</p></div></td></tr>`
									: ""
							}
							<tr>
								<td style="background:#f3f1ee; padding:18px 28px; text-align:center; color:#6b6b6b; font-size:13px;">
									<p style="margin:0;">This email was sent by Vinabooking. Please do not reply to this email.</p>
									<p style="margin:6px 0 0;">© ${new Date().getFullYear()} Vinabooking</p>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</body>
		</html>`;
	}
}
