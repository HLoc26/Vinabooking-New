import { type Request } from "express";

import type { ApiResponse, ConfirmUserResponse, GetOTPResponse, LogInResponse, RefreshResponse, SignUpResponse, VerifyResponse } from "./Response";

export interface SignUpInfo {
    email: string;
    password: string;
    name: string;
    phone: string;
}

export type SignUpRequest = Request<unknown, ApiResponse<SignUpResponse>, SignUpInfo, unknown>;

export interface ConfirmUserInfo {
    username: string;
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

export type VerifyRequest = Request<unknown, ApiResponse<VerifyResponse>, VerifyInfo, unknown>;

export interface RefreshInfo {
    refreshToken: string;
}

export type RefreshRequest = Request<unknown, ApiResponse<RefreshResponse>, RefreshInfo, unknown>;

export type GetOTPRequest = Request<unknown, ApiResponse<GetOTPResponse>, unknown, { email: string }>;
