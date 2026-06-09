import { IsString } from "class-validator";

/** Request body for `POST /bookings/confirm` — the booking id to confirm. */
export class ConfirmBookingRequest {
	@IsString()
	id!: string;
}
