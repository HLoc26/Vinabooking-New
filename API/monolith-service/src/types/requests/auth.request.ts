import { Request } from "express";
import { ETokenType } from "../auth/auth-token";
import { ERole } from "@/generated/enums";

export interface ConfirmForgotPasswordBody {
	email: string;
	code: string;
	newPassword: string;
}
export type ConfirmForgotPasswordRequest = Request<object, object, ConfirmForgotPasswordBody>;

export interface ConfirmUserBody {
	id: string;
	email: string;
	confirmCode: string;
}
export type ConfirmUserRequest = Request<object, object, ConfirmUserBody>;

export interface ForgotPasswordBody {
	email: string;
}
export type ForgotPasswordRequest = Request<object, object, ForgotPasswordBody>;

export interface GetOTPQuery {
	email: string;
}
export type GetOTPRequest = Request<object, object, object, GetOTPQuery>;

export interface GoogleCallbackQuery {
	code: string;
}
export type GoogleCallbackRequest = Request<object, object, object, GoogleCallbackQuery>;

export interface LogInBody {
	email: string;
	password: string;
}
export type LogInRequest = Request<object, object, LogInBody>;

export interface SignUpBody {
	email: string;
	password: string;
	name: string;
	phone: string | null;
	userType: ERole;
}
export type SignUpRequest = Request<object, object, SignUpBody>;

export interface VerifyTokenBody {
	token: string;
	tokenType: ETokenType; // Use Enum
}
export type VerifyRequest = Request<object, object, VerifyTokenBody>;

export interface AuthRequest extends Request {
	userId?: string;
}
