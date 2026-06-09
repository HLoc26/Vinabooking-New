import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { EViewType } from "@/modules/room/enums/EViewType";
import { EPricingType } from "@/modules/room/enums/EPricingType";
import { CreateBedRequest } from "@/modules/room/dto/request/CreateBedRequest";

/**
 * Request body for `POST /rooms/accommodation/:accommodationId`. Mirrors the
 * monolith CreateRoomDTO. A room must have at least one bed; the service enforces
 * the floorPrice ≤ basePrice invariant.
 */
export class CreateRoomRequest {
	@IsString()
	@IsNotEmpty()
	name!: string;

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

	@IsNumber()
	@Min(0)
	basePrice!: number;

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

	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => CreateBedRequest)
	beds!: CreateBedRequest[];

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	amenityIds?: string[];
}
