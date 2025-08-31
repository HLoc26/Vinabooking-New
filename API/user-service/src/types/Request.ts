import type { Request } from "express";
import type { ApiResponse, UserResponse, CacheUserResponse } from "./Response.ts";

export type FindUserByIdRequest = Request<{ id: string }, ApiResponse<UserResponse>, unknown, { withFavourites?: string }>;

export type CacheUserRequest = Request<unknown, ApiResponse<CacheUserResponse>, { cognitoSub: string; email: string }, unknown>;
