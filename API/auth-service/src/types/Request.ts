import { type Request } from "express";

import type { ApiResponse, ConfirmUserResponse, LogInResponse, SignUpResponse } from "./Response.ts";

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
