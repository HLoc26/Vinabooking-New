import type { Request } from "express";
import type {
	ApiResponse,
	UserResponse,
	CacheUserResponse,
	SaveUserResponse,
	AddAccommodationToFavouriteResponse,
	RemoveAccommodationFromFavouriteResponse,
	CreateFavouriteListResponse,
	DeleteFavouriteListResponse,
} from "./Response";

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

export interface AddAccommodationToFavouriteRequestPayload {
	userId: string;
	listId: string;
	accommodationId: string;
}

export type AddAccommodationToFavouriteRequest = Request<unknown, ApiResponse<AddAccommodationToFavouriteResponse>, AddAccommodationToFavouriteRequestPayload, unknown>;
export interface AuthenticatedAddAccommodationRequest extends AddAccommodationToFavouriteRequest {
	user: { id: string; username: string };
}

export type RemoveAccommodationFromFavouriteRequest = Request<unknown, ApiResponse<RemoveAccommodationFromFavouriteResponse>, unknown, { accommodationId: string; listId: string }>;
export interface AuthenticatedRemoveAccommodationRequest extends RemoveAccommodationFromFavouriteRequest {
	user: { id: string; username: string };
}

export interface CreateFavouriteListPayload {
	name: string;
}
export type CreateFavouriteListRequest = Request<unknown, ApiResponse<CreateFavouriteListResponse>, CreateFavouriteListPayload, unknown>;
export interface AuthenticatedCreateFavouriteListRequest extends CreateFavouriteListRequest {
	user: { id: string; username: string };
}

export type DeleteFavouriteListRequest = Request<
	unknown, // params
	ApiResponse<DeleteFavouriteListResponse>, // response body
	unknown, // request body
	{ listId: string } // query
>;
export interface AuthenticatedDeleteFavouriteListRequest extends DeleteFavouriteListRequest {
	user: { id: string; username: string };
}

export interface UpdateUserPayload {
	name?: string;
	phone?: string;
}

export type UpdateUserRequest = Request<{ id: string }, ApiResponse<UserResponse>, UpdateUserPayload, unknown>;
export interface AuthenticatedUpdateUserRequest extends UpdateUserRequest {
	user: { id: string; username: string };
}
