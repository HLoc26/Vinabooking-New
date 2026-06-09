import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Type, Transform } from "class-transformer";
import { EAccommodationType } from "@/modules/accommodation/enums/EAccommodationType";
import { ESortOption } from "@/modules/accommodation/enums/ESortOption";

/**
 * Query parameters for `GET /accommodations/search`. Ported from the monolith
 * SearchQuery; numeric fields are coerced from the query string. `facilities`
 * may arrive as a single value or an array — normalized to an array.
 */
export class SearchAccommodationRequest {
	@IsOptional()
	@IsString()
	keyword?: string;

	@IsOptional()
	@IsEnum(EAccommodationType)
	type?: EAccommodationType;

	@IsOptional()
	@IsString()
	checkIn?: string;

	@IsOptional()
	@IsString()
	checkOut?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	adults?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	children?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	rooms?: number;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	minPrice?: number;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	maxPrice?: number;

	@IsOptional()
	@Transform(({ value }) => (value === undefined ? undefined : Array.isArray(value) ? value : [value]))
	@IsArray()
	@IsString({ each: true })
	facilities?: string[];

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit?: number;

	@IsOptional()
	@IsEnum(ESortOption)
	sortBy?: ESortOption;
}
