import type { Request } from "express";
import type { ApiResponse, UserResponse, CacheUserResponse, SaveUserResponse } from "./Response.ts";

export type FindUserByIdRequest = Request<{ id: string }, ApiResponse<UserResponse>, unknown, { withFavourites?: string }>;

export interface CacheInfo {
    email: string; // key
    info: {
        cognitoSub: string;
        name: string;
        phone: string;
    };
}

export type CacheUserRequest = Request<unknown, ApiResponse<CacheUserResponse>, CacheInfo, unknown>;

export type SaveUserRequest = Request<unknown, ApiResponse<SaveUserResponse>, { email: string }, unknown>;
