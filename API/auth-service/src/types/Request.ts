import { type Request } from "express";

import type { ApiResponse, SignUpResponse } from "./Response.ts";

export type SignUpRequest = Request<unknown, ApiResponse<SignUpResponse>, { email: string; password: string; name: string; phone: string }, unknown>;
