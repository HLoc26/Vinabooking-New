import type { Request } from "express";
import type { ApiResponse, UserResponse } from "./Response.ts";

export type FindUserByIdRequest = Request<{ id: string }, ApiResponse<UserResponse>, unknown, { withFavourites?: string }>;
