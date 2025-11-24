// src/clients/EmailServiceClient.ts
import axios from "axios";
import { AccommodationPayload, AccommodationImage, ImageVariant } from "../types/Accommodation";
import { EItemType } from "../../generated/prisma/client";

export interface ConfirmationEmailData {
	to: string;
	accommodation: AccommodationPayload;
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

export class EmailServiceClient {
	private axiosInstance = axios.create({
		baseURL: process.env.EMAIL_ENDPOINT,
		timeout: 5000,
	});

	// helper: pick best image by variant priority
	private pickBestImage(images: AccommodationImage[] | undefined, priority: ImageVariant[] = ["ORIGINAL", "OPTIMIZED", "WEBP", "THUMBNAIL"]): AccommodationImage | undefined {
		if (!images || images.length === 0) return undefined;
		for (const v of priority) {
			const found = images.find((img) => img.variant === v);
			if (found) return found;
		}
		// fallback to first
		return images[0];
	}

	// helper: pick up to `count` images, preferring unique imageId and variant priority
	private pickGallery(images: AccommodationImage[] | undefined, count = 3, priority: ImageVariant[] = ["OPTIMIZED", "WEBP", "ORIGINAL", "THUMBNAIL"]): AccommodationImage[] {
		if (!images || images.length === 0) return [];
		const picked: AccommodationImage[] = [];

		// prefer variants in priority order, select unique imageId
		for (const variant of priority) {
			for (const img of images) {
				if (picked.length >= count) break;
				if (img.variant !== variant) continue;
				if (picked.find((p) => p.imageId === img.imageId)) continue;
				picked.push(img);
			}
			if (picked.length >= count) break;
		}

		// fill with any remaining images if still < count
		for (const img of images) {
			if (picked.length >= count) break;
			if (picked.find((p) => p.imageId === img.imageId)) continue;
			picked.push(img);
		}

		return picked.slice(0, count);
	}

	public async sendConfirmationEmail(data: ConfirmationEmailData): Promise<void> {
		const { to, accommodation, checkIn, checkOut, guestName, referenceNo, roomType, guestCount, nights, specialRequest, totalCharge } = data;

		// accommodation is the wrapper { success, data, error }
		const accomData = accommodation?.data;
		const images = accomData?.images;

		// choose a primary image and gallery images
		const primary = this.pickBestImage(images, ["ORIGINAL", "OPTIMIZED", "WEBP", "THUMBNAIL"]);
		const gallery = this.pickGallery(images, 3, ["OPTIMIZED", "WEBP", "ORIGINAL", "THUMBNAIL"]);

		const subject = "Booking Confirmation";
		const message = `Your booking at ${accomData?.name || "the property"} from ${checkIn} to ${checkOut} has been confirmed.`;

		// build gallery HTML (skip primary if same as gallery first)

		/* eslint-disable indent, max-len */
		const html = `
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
                
                <!-- HEADER IMAGE -->
                ${
					primary
						? `
                <tr>
                  <td style="padding:0;">
                    <img src="${primary.url}" alt="${accomData?.name || "property image"}" style="width:100%; height:320px; object-fit:cover; display:block;" />
                  </td>
                </tr>`
						: ""
				}

                <!-- HEADER -->
                <tr>
                  <td style="padding:22px 28px; text-align:left;">
                    <h1 style="margin:0; font-size:24px; color:#1f2933;">Your booking is confirmed</h1>
                    <p style="margin:8px 0 0; color:#565a5c;">Hi <strong>${guestName || "Guest"}</strong>, your reservation is all set. Below are the details.</p>
                  </td>
                </tr>

                <!-- PROPERTY INFO -->
                <tr>
                  <td style="padding:0 28px 18px;">
                    <div style="background:#faf8f6; padding:16px; border-radius:8px; border:1px solid #efe9e3;">
                      <h2 style="margin:0; font-size:18px; color:#2b2b2b;">${accomData.name || "Property"}</h2>
                      ${referenceNo ? `<p style="margin:6px 0 0; color:#6b6b6b;">Reference No: <strong>${referenceNo}</strong></p>` : ""}
                      ${accomData?.description ? `<p style="margin:8px 0 0; color:#6b6b6b;">${accomData.description}</p>` : ""}
                    </div>
                  </td>
                </tr>

                <!-- DATES & DETAILS -->
                <tr>
                  <td style="padding:18px 28px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; border-collapse:collapse;">
                      <tr>
                        <td style="width:50%; padding:8px 0; color:#7b7b7b;">Check-in</td>
                        <td style="width:50%; padding:8px 0; text-align:right;"><strong>${checkIn}</strong></td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; color:#7b7b7b;">Check-out</td>
                        <td style="padding:8px 0; text-align:right;"><strong>${checkOut}</strong></td>
                      </tr>
                      ${roomType ? `<tr><td style="padding:8px 0; color:#7b7b7b;">Room type</td><td style="padding:8px 0; text-align:right;"><strong>${roomType}</strong></td></tr>` : ""}
                      ${guestCount ? `<tr><td style="padding:8px 0; color:#7b7b7b;">Guests</td><td style="padding:8px 0; text-align:right;"><strong>${guestCount}</strong></td></tr>` : ""}
                      ${nights ? `<tr><td style="padding:8px 0; color:#7b7b7b;">Nights</td><td style="padding:8px 0; text-align:right;"><strong>${nights}</strong></td></tr>` : ""}
                  ${specialRequest ? `<tr><td style="padding:8px 0; color:#7b7b7b;">Special request</td><td style="padding:8px 0; text-align:right;"><strong>${specialRequest}</strong></td></tr>` : ""}
                      ${totalCharge ? `<tr><td style="padding:8px 0; color:#7b7b7b;">Total charge</td><td style="padding:8px 0; text-align:right;"><strong>${totalCharge}</strong></td></tr>` : ""}
                    </table>
                  </td>
                </tr>

                <!-- 3-IMAGE GALLERY -->
                ${
					gallery && gallery.length > 0
						? `
                <tr>
                  <td style="padding:0 28px 22px;">
                    <h3 style="margin:0 0 10px; font-size:16px; color:#2b2b2b;">Photos</h3>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;"><tr>
                      ${gallery.map((g) => `<td style="padding-right:8px;"><img src="${g.url}" alt="photo" style="width:100%; max-width:200px; height:120px; object-fit:cover; border-radius:8px; display:block;" /></td>`).join("")}
                    </tr></table>
                  </td>
                </tr>`
						: ""
				}

                <!-- CTA -->
                <tr>
                  <td style="padding:0 28px 22px; text-align:center;">
                    <a href="#" style="background:#0066cc; color:#ffffff; text-decoration:none; padding:12px 22px; border-radius:6px; display:inline-block; font-weight:600;">Manage my booking</a>
                  </td>
                </tr>

                <!-- FOOTER -->
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
      </html>
    `;

		/* eslint-enable indent, max-len */
		// POST to email service (body shape: { to, subject, message, html })
		await this.axiosInstance.post("/", { to, subject, message, html });
	}
}
