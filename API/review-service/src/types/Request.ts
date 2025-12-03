import { Request } from "express";
import { ApiResponse, CreateReviewResponse, GetReviewsResponse } from "./Response";
import { UserPayload } from "./User";
import { CreateReviewPayload } from "./Review";

export interface AuthenticatedRequest<P = unknown, R = unknown, B = unknown, Q = unknown> extends Request<P, R, B, Q> {
	user: UserPayload;
}

export type CreateReviewRequest = AuthenticatedRequest<unknown, ApiResponse<CreateReviewResponse>, CreateReviewPayload, unknown>;

export type GetAccommodationReviewsRequest = Request<{ accommodationId: string }, ApiResponse<GetReviewsResponse>, unknown, unknown>;

export type GetUserReviewsRequest = AuthenticatedRequest<unknown, ApiResponse<GetReviewsResponse>, unknown, unknown>;
