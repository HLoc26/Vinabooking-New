import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { SendMailRequest, SendMailResponse } from "../../generated/grpc/email-service/email-service";
import { IMailClient } from "../types/IMailClient";
import { Address } from "nodemailer/lib/mailer";

class GrpcEmailController {
    constructor(private mailClient: IMailClient) {}

    private normalizeAddresses(arr: (string | Address)[] = []): string[] {
        return arr.map((a) => (typeof a === "string" ? a : a.address));
    }

    public async sendMail(call: ServerUnaryCall<SendMailRequest, SendMailResponse>, callback: sendUnaryData<SendMailResponse>) {
        try {
            const { to, subject, message, html } = call.request;
            const info = await this.mailClient.send(to, subject, message, html);

            const response: SendMailResponse = {
                success: true,
                data: {
                    messageId: info.messageId,
                    envelope: {
                        from: typeof info.envelope.from === "string" ? info.envelope.from : "",
                        to: info.envelope.to,
                    },
                    accepted: this.normalizeAddresses(info.accepted),
                    rejected: this.normalizeAddresses(info.rejected),
                    pending: this.normalizeAddresses(info.pending),
                    response: info.response,
                },
                error: "",
            };
            callback(null, response);
        } catch (error: unknown) {
            const err = error as Error;
            callback(null, {
                success: false,
                data: undefined,
                error: err.message || "Failed to send email",
            });
        }
    }
}

export default GrpcEmailController;
