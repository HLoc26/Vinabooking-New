import { IsEnum, IsOptional, IsString } from "class-validator";
import { EAccommodationType } from "@/modules/accommodation/enums/EAccommodationType";

/** Request body for `PATCH /accommodations/:id` (basic info). All fields optional. */
export class UpdateAccommodationRequest {
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsEnum(EAccommodationType)
	type?: EAccommodationType;
}
