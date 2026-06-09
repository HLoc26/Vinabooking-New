import { IsEnum, IsOptional, IsString } from "class-validator";
import { EAccommodationType } from "@/modules/accommodation/enums/EAccommodationType";

/** Query parameters for `GET /accommodations/count?city=...&type=...`. */
export class GetCountRequest {
	@IsOptional()
	@IsString()
	city?: string;

	@IsOptional()
	@IsEnum(EAccommodationType)
	type?: EAccommodationType;
}
