import { User } from "@/generated/client";
import { UserUpdateInput } from "@/generated/models";
import { Request } from "express";

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
