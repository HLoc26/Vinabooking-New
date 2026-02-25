import { CancellationEmailData, ConfirmationEmailData } from "@/types/email.types";
import SmtpClient from "../clients/smtp.client";
import { SentMessageInfo } from "nodemailer/lib/smtp-transport";
import ImageUtils from "@/utils/image";
import S3Service from "./s3.service";

export class EmailService {
	private readonly smtpClient = SmtpClient.getInstance();
	readonly #s3Service: S3Service;

	constructor(s3Service: S3Service) {
		this.#s3Service = s3Service;
	}

	/**
	 * Gửi OTP xác thực
	 */
	public async sendOtp(email: string, otp: string): Promise<SentMessageInfo> {
		const subject = "Mã xác thực Vinabooking của bạn";
		const message = `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn trong 5 phút.`;

		const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Xin chào,</h2>
                <p>Mã xác thực OTP của bạn là:</p>
                <h1 style="color: #2c3e50; letter-spacing: 5px;">${otp}</h1>
                <p>Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ cho bất kỳ ai.</p>
                <br/>
                <p>Thân mến,<br/>Đội ngũ Vinabooking</p>
            </div>
        `;

		return this.smtpClient.send(email, subject, message, html);
	}

	/**
	 * Gửi Email chào mừng
	 */
	public async sendWelcome(email: string, name: string): Promise<SentMessageInfo> {
		const subject = "Chào mừng đến với Vinabooking!";
		const message = `Xin chào ${name}, cảm ơn bạn đã đăng ký tài khoản tại Vinabooking.`;

		const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Xin chào ${name}! 👋</h2>
                <p>Cảm ơn bạn đã trở thành thành viên của <b>Vinabooking</b>.</p>
                <p>Hãy bắt đầu khám phá những địa điểm tuyệt vời ngay hôm nay.</p>
                <br/>
                <a href="${process.env.CLIENT_URL}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Khám phá ngay</a>
            </div>
        `;

		return this.smtpClient.send(email, subject, message, html);
	}

	public async sendConfirmationEmail(data: ConfirmationEmailData): Promise<void> {
		const { to, accommodation, checkIn, checkOut, guestName, referenceNo, roomType, guestCount, nights, specialRequest, totalCharge } = data;

		// accommodation is the wrapper { success, data, error }
		const accomData = accommodation;
		const images = accomData?.images;

		// choose a primary image and gallery images
		let primary;
		let gallery;

		if (images) {
			primary = ImageUtils.pickBestImage(images, ["ORIGINAL", "OPTIMIZED", "WEBP", "THUMBNAIL"]);
			gallery = ImageUtils.pickGallery(images, 3, ["OPTIMIZED", "WEBP", "ORIGINAL", "THUMBNAIL"]);
		}

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
                    <img src="${this.#s3Service.getS3Url(primary.s3Key)}" alt="${accomData?.name || "property image"}" style="width:100%; height:320px; object-fit:cover; display:block;" />
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
                      ${gallery.map((g) => `<td style="padding-right:8px;"><img src="${this.#s3Service.getS3Url(g.s3Key)}" alt="photo" style="width:100%; max-width:200px; height:120px; object-fit:cover; border-radius:8px; display:block;" /></td>`).join("")}
                    </tr></table>
                  </td>
                </tr>`
						: ""
				}

                <!-- CTA -->
                <tr>
                  <td style="padding:0 28px 22px; text-align:center;">
                    <a href="${process.env.CLIENT_URL}/user" style="background:#0066cc; color:#ffffff; text-decoration:none; padding:12px 22px; border-radius:6px; display:inline-block; font-weight:600;">Manage my booking</a>
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
		await this.smtpClient.send(to, subject, message, html);
	}

	public async sendCancellationEmail(data: CancellationEmailData): Promise<void> {
		const { to, accommodation, guestName, referenceNo, roomType, nights } = data;
		const accomData = accommodation;

		const subject = "Booking Cancellation";
		const message = `Your booking at ${accomData?.name || "the property"} has been cancelled.`;

		/* eslint-disable max-len, indent */
		const html = `
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
								<p style="margin:8px 0 0; color:#565a5c;">Hi <strong>${guestName || "Guest"}</strong>, your reservation has been successfully cancelled.</p>
							</td>
						</tr>

						<tr>
							<td style="padding-bottom:18px;">
								<div style="background:#faf8f6; padding:16px; border-radius:8px; border:1px solid #efe9e3;">
									<h2 style="margin:0; font-size:18px; color:#2b2b2b;">${accomData?.name || "Property"}</h2>
									${referenceNo ? `<p style="margin:6px 0 0; color:#6b6b6b;">Reference No: <strong>${referenceNo}</strong></p>` : ""}
									${roomType ? `<p style="margin:6px 0 0; color:#6b6b6b;">Room type: <strong>${roomType}</strong></p>` : ""}
									${nights ? `<p style="margin:6px 0 0; color:#6b6b6b;">Nights: <strong>${nights}</strong></p>` : ""}
								</div>
							</td>
						</tr>

						<tr>
							<td style="padding:0 0 22px; text-align:center;">
								<a href="${process.env.CLIENT_URL}/user" style="background:#0066cc; color:#ffffff; text-decoration:none; padding:12px 22px; border-radius:6px; display:inline-block; font-weight:600;">View my bookings</a>
							</td>
						</tr>

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
		/* eslint-enable max-len, indent */

		await this.smtpClient.send(to, subject, message, html);
	}

	/**
	 * Hàm gửi email thô (Dùng cho Admin hoặc Testing thông qua API)
	 */
	public async sendRaw(to: string | string[], subject: string, message: string, html?: string): Promise<SentMessageInfo> {
		return this.smtpClient.send(to, subject, message, html);
	}
}

export default EmailService;
