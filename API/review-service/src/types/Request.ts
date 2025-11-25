import { Request } from "express";
import { ApiResponse, CreateReviewResponse } from "./Response";
import { UserPayload } from "./User";
import { CreateReviewPayload } from "./Review";

export interface CreateReviewRequest extends Request<unknown, ApiResponse<CreateReviewResponse>, CreateReviewPayload, unknown> {
	user: UserPayload;
}
