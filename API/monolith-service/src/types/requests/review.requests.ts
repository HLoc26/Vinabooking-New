import { Request } from "express";

// Payload body mà Frontend sẽ gửi lên khi tạo Review hoặc Reply
export interface CreateReviewPayload {
	star?: number;
	comment: string;
	bookingId?: string;
	parentId?: string;
	accommodationId?: string;
}

// Request Object dùng trong Controller (POST /reviews)
export type CreateReviewRequest = Request<unknown, unknown, CreateReviewPayload>;

// Request Object dùng để lấy review (GET /reviews/accommodation/:accommodationId)
// Param: accommodationId
export type GetAccommodationReviewsRequest = Request<{ accommodationId: string }>;

export type GetUserByBookingRequest = Request<{ bookingId: string }>;
