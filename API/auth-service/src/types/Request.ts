import { type Request } from "express";

import type { ApiResponse, SignUpResponse } from "./Response.ts";

export type SignUpRequest = Request<unknown, ApiResponse<SignUpResponse>, { username: string; password: string; email: string }, unknown>;
