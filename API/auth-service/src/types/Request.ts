import { type Request } from "express";

import type { ApiResponse, SignUpResponse } from "./Response.ts";

export interface SignUpInfo {
    email: string;
    password: string;
    name: string;
    phone: string;
}

export type SignUpRequest = Request<unknown, ApiResponse<SignUpResponse>, SignUpInfo, unknown>;
