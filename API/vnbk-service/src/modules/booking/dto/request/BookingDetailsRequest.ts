import { ArrayMinSize, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { BookingDetailRequest } from "@/modules/booking/dto/request/BookingDetailRequest";

/**
 * The nested `details` envelope of a booking payload. Mirrors the monolith's
 * Prisma-style `{ create: [...] }` shape so the FE payload is unchanged.
 */
export class BookingDetailsRequest {
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => BookingDetailRequest)
	create!: BookingDetailRequest[];
}
