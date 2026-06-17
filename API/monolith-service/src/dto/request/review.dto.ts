import { Request } from "express";

export interface CreateReviewPayload {
	star?: number;
	comment: string;
	bookingId?: string;
	parentId?: string;
	accommodationId?: string;
}

export type CreateReviewRequest = Request<unknown, unknown, CreateReviewPayload>;

export type GetAccommodationReviewsRequest = Request<{ accommodationId: string }>;

export type GetUserByBookingRequest = Request<{ bookingId: string }>;
