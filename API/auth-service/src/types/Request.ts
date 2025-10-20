import { type Request } from "express";

import type { ApiResponse, ConfirmUserResponse, LogInResponse, SignUpResponse } from "./Response";

export interface SignUpInfo {
    email: string;
    password: string;
    name: string;
    phone: string;
}

export type SignUpRequest = Request<unknown, ApiResponse<SignUpResponse>, SignUpInfo, unknown>;

export interface ConfirmUserInfo {
    email: string;
    confirmCode: string;
}

export type ConfirmUserRequest = Request<unknown, ApiResponse<ConfirmUserResponse>, ConfirmUserInfo, unknown>;

export interface LogInInfo {
    username: string; // email
    password: string;
}

export type LogInRequest = Request<unknown, ApiResponse<LogInResponse>, LogInInfo, unknown>;

export interface VerifyInfo {
    token: string;
    tokenType: ETokenType;
}

export enum ETokenType {
    ACCESS = "ACCESS",
    ID = "ID",
}

export type VerifyRequest = Request<unknown, ApiResponse<VerifyRequest>, VerifyInfo, unknown>;
