import { IMailClient } from "../types/IMailClient";
import { SendMailRequest } from "../types/Request";
import { SendMailResponse, SendMailResponsePayload } from "../types/Response";
import ResponseHelper from "../utils/ResponseHelper";

class EmailController {
	constructor(private mailClient: IMailClient) {}

	public async sendMail(req: SendMailRequest, res: SendMailResponse) {
		const { to, subject, message, html } = req.body;
		const info = await this.mailClient.send(to, subject, message, html);

		return ResponseHelper.success<SendMailResponsePayload>(res, info);
	}
}

export default EmailController;
