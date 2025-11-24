// Request.ts
import { type Request } from "express";
import { UserPayload } from "./User";
import { BookingPayload, ConfirmPayload } from "./Booking"; // example
import { ApiResponse, BookingResponse } from "./Response";

export interface AuthenticatedRequest extends Request {
	user: UserPayload;
}
type UnauthBookingRequest = Request<unknown, ApiResponse<BookingResponse>, BookingPayload, unknown>;

export interface BookingRequest extends UnauthBookingRequest {
	user: UserPayload;
}
export type ConfirmRequest = Request<unknown, ApiResponse<BookingResponse>, ConfirmPayload, unknown>;
