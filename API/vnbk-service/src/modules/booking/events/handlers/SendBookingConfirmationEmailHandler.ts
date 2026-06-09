import { inject, injectable } from "tsyringe";
import type { IDomainEventHandler } from "@/shared/events/IDomainEventHandler";
import type { BookingConfirmedEvent } from "@/modules/booking/events/BookingConfirmedEvent";
import { ACCOMMODATION_SERVICE, type IAccommodationService, type AccommodationResponse } from "@/modules/accommodation";
import { USER_SERVICE, type IUserService } from "@/modules/user";
import { MAIL_SENDER } from "@/infrastructure/infrastructure.tokens";
import type { IMailSender } from "@/infrastructure/mail/IMailSender";
import type { ImageResponse } from "@/modules/image";

/**
 * Cross-module side effect of a confirmation: assemble + send the confirmation
 * email. Subscribed to BookingConfirmedEvent in BookingModule. It resolves the
 * owning accommodation (from the first detail's roomId) and the guest, then sends
 * to the guest and — if different — to the leader. The booking service never
 * touches email; this handler owns the templating (ported from the monolith).
 */
@injectable()
export class SendBookingConfirmationEmailHandler implements IDomainEventHandler<BookingConfirmedEvent> {
	constructor(
		@inject(ACCOMMODATION_SERVICE) private readonly accommodationService: IAccommodationService,
		@inject(USER_SERVICE) private readonly userService: IUserService,
		@inject(MAIL_SENDER) private readonly mailSender: IMailSender
	) {}

	public async handle(event: BookingConfirmedEvent): Promise<void> {
		const accommodation = await this.accommodationService.getAccommodationByRoomId(event.roomId);
		const user = await this.userService.getById(event.userId);

		const checkIn = this.formatDate(event.checkIn);
		const checkOut = this.formatDate(event.checkOut);
		const totalCharge = event.totalPrice === null ? undefined : event.totalPrice.toString();

		const subject = "Booking Confirmation";

		// Send to the guest (the account holder)…
		await this.mailSender.send({
			to: user.email,
			subject,
			html: this.buildHtml(accommodation, {
				guestName: user.name,
				checkIn,
				checkOut,
				referenceNo: event.referenceNo,
				roomType: event.itemType,
				guestCount: event.guestCount,
				nights: event.nights,
				specialRequest: event.specialRequest ?? undefined,
				totalCharge,
			}),
		});

		// …and to the trip leader, if a distinct contact was given.
		if (event.leaderEmail && event.leaderEmail !== user.email) {
			await this.mailSender.send({
				to: event.leaderEmail,
				subject,
				html: this.buildHtml(accommodation, {
					guestName: event.leaderName ?? "Guest",
					checkIn,
					checkOut,
					referenceNo: event.referenceNo,
					roomType: event.itemType,
					guestCount: event.guestCount,
					nights: event.nights,
					specialRequest: event.specialRequest ?? undefined,
					totalCharge,
				}),
			});
		}
	}

	private formatDate(date: Date): string {
		return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
	}

	private pickPrimaryUrl(images: ImageResponse[]): string | undefined {
		if (!images || images.length === 0) return undefined;
		const primary = images.find((img) => img.references?.some((ref) => ref.isPrimary));
		return (primary ?? images[0]).url;
	}

	private pickGalleryUrls(images: ImageResponse[], limit: number): string[] {
		if (!images || images.length === 0) return [];
		return images.slice(0, limit).map((img) => img.url);
	}

	private buildHtml(
		accommodation: AccommodationResponse,
		data: {
			guestName: string;
			checkIn: string;
			checkOut: string;
			referenceNo: number;
			roomType: string;
			guestCount: number;
			nights: number;
			specialRequest?: string;
			totalCharge?: string;
		}
	): string {
		const primary = this.pickPrimaryUrl(accommodation.images);
		const gallery = this.pickGalleryUrls(accommodation.images, 3);
		const name = accommodation.name || "Property";

		return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>Booking Confirmation</title>
		</head>
		<body style="margin:0; padding:0; background-color:#f7f5f2; font-family: Arial, sans-serif;">
			<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f5f2; padding:20px 0;">
				<tr>
					<td align="center">
						<table role="presentation" width="650" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 6px 18px rgba(0,0,0,0.06);">
							${primary ? `<tr><td style="padding:0;"><img src="${primary}" alt="${name}" style="width:100%; height:320px; object-fit:cover; display:block;" /></td></tr>` : ""}
							<tr>
								<td style="padding:22px 28px; text-align:left;">
									<h1 style="margin:0; font-size:24px; color:#1f2933;">Your booking is confirmed</h1>
									<p style="margin:8px 0 0; color:#565a5c;">Hi <strong>${data.guestName}</strong>, your reservation is all set. Below are the details.</p>
								</td>
							</tr>
							<tr>
								<td style="padding:0 28px 18px;">
									<div style="background:#faf8f6; padding:16px; border-radius:8px; border:1px solid #efe9e3;">
										<h2 style="margin:0; font-size:18px; color:#2b2b2b;">${name}</h2>
										<p style="margin:6px 0 0; color:#6b6b6b;">Reference No: <strong>${data.referenceNo}</strong></p>
										${accommodation.description ? `<p style="margin:8px 0 0; color:#6b6b6b;">${accommodation.description}</p>` : ""}
									</div>
								</td>
							</tr>
							<tr>
								<td style="padding:18px 28px;">
									<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; border-collapse:collapse;">
										<tr><td style="width:50%; padding:8px 0; color:#7b7b7b;">Check-in</td><td style="width:50%; padding:8px 0; text-align:right;"><strong>${data.checkIn}</strong></td></tr>
										<tr><td style="padding:8px 0; color:#7b7b7b;">Check-out</td><td style="padding:8px 0; text-align:right;"><strong>${data.checkOut}</strong></td></tr>
										<tr><td style="padding:8px 0; color:#7b7b7b;">Room type</td><td style="padding:8px 0; text-align:right;"><strong>${data.roomType}</strong></td></tr>
										<tr><td style="padding:8px 0; color:#7b7b7b;">Guests</td><td style="padding:8px 0; text-align:right;"><strong>${data.guestCount}</strong></td></tr>
										<tr><td style="padding:8px 0; color:#7b7b7b;">Nights</td><td style="padding:8px 0; text-align:right;"><strong>${data.nights}</strong></td></tr>
										${data.specialRequest ? `<tr><td style="padding:8px 0; color:#7b7b7b;">Special request</td><td style="padding:8px 0; text-align:right;"><strong>${data.specialRequest}</strong></td></tr>` : ""}
										${data.totalCharge ? `<tr><td style="padding:8px 0; color:#7b7b7b;">Total charge</td><td style="padding:8px 0; text-align:right;"><strong>${data.totalCharge}</strong></td></tr>` : ""}
									</table>
								</td>
							</tr>
							${
								gallery.length > 0
									? `<tr><td style="padding:0 28px 22px;"><h3 style="margin:0 0 10px; font-size:16px; color:#2b2b2b;">Photos</h3><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;"><tr>${gallery
											.map((url) => `<td style="padding-right:8px;"><img src="${url}" alt="photo" style="width:100%; max-width:200px; height:120px; object-fit:cover; border-radius:8px; display:block;" /></td>`)
											.join("")}</tr></table></td></tr>`
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
