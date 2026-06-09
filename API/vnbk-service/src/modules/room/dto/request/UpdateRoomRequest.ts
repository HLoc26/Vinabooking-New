import { IsArray, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { EViewType } from "@/modules/room/enums/EViewType";
import { EPricingType } from "@/modules/room/enums/EPricingType";
import { UpdateBedRequest } from "@/modules/room/dto/request/UpdateBedRequest";

/**
 * Request body for `PATCH /rooms/:id`. Mirrors the monolith UpdateRoomDTO: every
 * field is optional (partial update). When `beds` is supplied it fully syncs the
 * room's beds (create new, update by id, delete the rest); when `amenityIds` is
 * supplied it fully syncs the room's amenity configs.
 */
export class UpdateRoomRequest {
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsInt()
	@Min(1)
	quantity?: number;

	@IsOptional()
	@IsInt()
	@Min(1)
	maxAdults?: number;

	@IsOptional()
	@IsInt()
	@Min(0)
	maxChildren?: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	size?: number;

	@IsOptional()
	@IsInt()
	@Min(0)
	bedroomCount?: number;

	@IsOptional()
	@IsInt()
	@Min(0)
	bathroomCount?: number;

	@IsOptional()
	@IsEnum(EViewType)
	viewType?: EViewType;

	@IsOptional()
	@IsString()
	viewDescription?: string;

	@IsOptional()
	@IsNumber()
	@Min(0)
	basePrice?: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	floorPrice?: number;

	@IsOptional()
	@IsEnum(EPricingType)
	pricingType?: EPricingType;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => UpdateBedRequest)
	beds?: UpdateBedRequest[];

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	amenityIds?: string[];
}
