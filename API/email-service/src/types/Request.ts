import { Request } from "express";
import { SendMailResponse } from "./Response";

export type SendMailRequestPayload = {
    to: string;
    subject: string;
    message: string;
    html?: string;
};

export type SendMailRequest = Request<unknown, SendMailResponse, SendMailRequestPayload, unknown>;
