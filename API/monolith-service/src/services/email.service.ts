import SmtpClient from "../clients/smtp.client";
import { SentMessageInfo } from "nodemailer/lib/smtp-transport";

export class EmailService {
	private readonly smtpClient = SmtpClient.getInstance();

	constructor() {
		console.log("[EmailService] Initialized.");
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
                <a href="${process.env.CLIENT_URL || "#"}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Khám phá ngay</a>
            </div>
        `;

		return this.smtpClient.send(email, subject, message, html);
	}

	/**
	 * Hàm gửi email thô (Dùng cho Admin hoặc Testing thông qua API)
	 */
	public async sendRaw(to: string | string[], subject: string, message: string, html?: string): Promise<SentMessageInfo> {
		return this.smtpClient.send(to, subject, message, html);
	}
}

export default EmailService;
