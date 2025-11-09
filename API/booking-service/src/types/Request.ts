// Request.ts
import { type Request } from "express";
import { UserPayload } from "./User";
import { BookingPayload } from "./Booking"; // example
import { ApiResponse, BookingResponse } from "./Response";

export interface AuthenticatedRequest extends Request {
    user: UserPayload;
}

export type BookingRequest = Request<unknown, ApiResponse<BookingResponse>, BookingPayload, unknown>;

