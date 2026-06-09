import { IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { HolidayOptInRequest } from "@/modules/pricing/dto/request/HolidayOptInRequest";

/** Request body for `PUT /pricing/owners/me/holidays`. */
export class ReplaceHolidayOptInsRequest {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => HolidayOptInRequest)
	items!: HolidayOptInRequest[];
}
