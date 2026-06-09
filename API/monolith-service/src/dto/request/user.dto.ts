import { UserRole } from "@/models/user";

import { UserUpdateInput } from "@/generated/models";
import { Request } from "express";


export interface UserCreateDto {
    id: string; // Cognito sub
    email: string;
    name: string;
    phone?: string | null;
    role?: UserRole;
}

export interface UserUpdateDto {
    name?: string;
    phone?: string | null;
}

export interface UserCacheInfo {
    email: string;
    info: UserCreateDto;
}

export interface FindUserQuery {
	email: string;
	code: string;
	newPassword: string;
}
export type FindUserRequest = Request<object, object, object, FindUserQuery>;

export interface SaveUserBody {
	cognitoSub: string;
	email: string;
	name: string;
}

export type SaveUserRequest = Request<object, object, SaveUserBody>;

export type UpdateUserBody = UserUpdateInput;

export type UpdateUserRequest = Request<object, object, UpdateUserBody>;
