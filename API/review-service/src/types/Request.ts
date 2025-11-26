import { Request } from "express";
import { ApiResponse, CreateReviewResponse } from "./Response";
import { UserPayload } from "./User";
import { CreateReviewPayload } from "./Review";

export interface AuthenticatedRequest<P = unknown, R = unknown, B = unknown, Q = unknown> extends Request<P, R, B, Q> {
	user: UserPayload;
}

export type CreateReviewRequest = AuthenticatedRequest<unknown, ApiResponse<CreateReviewResponse>, CreateReviewPayload, unknown>;
