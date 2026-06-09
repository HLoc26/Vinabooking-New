import { IsOptional, IsString } from "class-validator";

/**
 * Request body for `PATCH /bookings/cancel` — an optional cancellation note. The
 * booking id comes from the `?id=` query param (matching the monolith), and the
 * source is fixed to TRAVELLER for the self-service cancel endpoint.
 */
export class CancelBookingRequest {
	@IsOptional()
	@IsString()
	note?: string;
}
