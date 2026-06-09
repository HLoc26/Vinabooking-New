import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { EBedType } from "@/modules/room/enums/EBedType";

/**
 * A bed in an update-room request. `id` present => update an existing bed;
 * `id` absent => create a new bed. Beds in the DB not referenced here are removed
 * (mirrors the monolith's diff-based bed sync).
 */
export class UpdateBedRequest {
	@IsOptional()
	@IsString()
	id?: string;

	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsEnum(EBedType)
	bedType?: EBedType;

	@IsOptional()
	@IsInt()
	@Min(1)
	quantity?: number;

	@IsOptional()
	@IsString()
	size?: string;

	@IsOptional()
	@IsNumber()
	@Min(0)
	price?: number;
}
