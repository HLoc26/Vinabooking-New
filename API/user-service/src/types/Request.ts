import type { Request } from "express";
import type { ApiResponse, UserResponse, CacheUserResponse, SaveUserResponse } from "./Response";

export type FindUserRequest = Request<unknown, ApiResponse<UserResponse>, unknown, { withFavourites?: string; email?: string; id?: string }>;

export type FindUserByIdRequest = Request<{ id: string }, ApiResponse<UserResponse>, unknown, { withFavourites?: string }>;

export interface CacheInfo {
    email: string; // key
    info: {
        cognitoSub: string;
        name: string;
        phone: string | null;
        userType: "TRAVELLER" | "ACCOMMODATION_OWNER";
    };
}

export type CacheUserRequest = Request<unknown, ApiResponse<CacheUserResponse>, CacheInfo, unknown>;

export type SaveUserRequest = Request<unknown, ApiResponse<SaveUserResponse>, { email: string }, unknown>;

export type SaveUserDirectRequest = Request<unknown, ApiResponse<SaveUserResponse>, { cognitoSub: string; email: string; name: string }, unknown>;
