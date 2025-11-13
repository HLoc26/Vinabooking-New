import { Response } from "express";
import { SentMessageInfo } from "nodemailer/lib/smtp-transport";

export type ApiResponse<T> = {
	success: boolean;
	data: T | null;
	error: string | null;
};

export type SendMailResponsePayload = SentMessageInfo;

export type SendMailResponse = Response<ApiResponse<SendMailResponsePayload>>;
