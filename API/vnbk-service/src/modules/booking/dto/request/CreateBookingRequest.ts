import { IsEmail, IsInt, IsISO8601, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { BookingDetailsRequest } from "@/modules/booking/dto/request/BookingDetailsRequest";

/**
 * Booking payload (ported from the monolith `BookingPayload`). Dates are ISO-8601
 * strings (the service converts them to Date). `quoteHash` is the anti-tamper
 * hash the FE echoes back from `POST /pricing/quote`: the service re-quotes and
 * rejects with 409 PRICE_CHANGED if it no longer matches. `bookedAt` is the
 * lead-day basis the FE captured before quoting, so the re-quote hash doesn't
 * drift across an HCM-midnight boundary.
 */
export class CreateBookingRequest {
	@IsISO8601()
	startDate!: string;

	@IsISO8601()
	endDate!: string;

	@IsInt()
	@Min(1)
	guestCount!: number;

	@IsString()
	quoteHash!: string;

	@IsOptional()
	@IsISO8601()
	bookedAt?: string;

	@ValidateNested()
	@Type(() => BookingDetailsRequest)
	details!: BookingDetailsRequest;

	@IsOptional()
	@IsString()
	phone?: string;

	@IsString()
	leaderName!: string;

	@IsEmail()
	leaderEmail!: string;
}
