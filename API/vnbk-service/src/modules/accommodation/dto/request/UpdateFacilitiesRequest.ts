import { IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { FacilityConfigInput } from "@/modules/accommodation/dto/request/FacilityConfigInput";

/**
 * Request body for `PUT /accommodations/:id/facilities`. Replaces the full set of
 * facility configs (the DAO deletes the old set and recreates from this list).
 */
export class UpdateFacilitiesRequest {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => FacilityConfigInput)
	facilities!: FacilityConfigInput[];
}
