import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { EBedType } from "@/modules/room/enums/EBedType";

/** A single bed in a create/update-room request (mirrors the monolith CreateBedBatchDTO). */
export class CreateBedRequest {
	@IsString()
	@IsNotEmpty()
	name!: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsEnum(EBedType)
	bedType!: EBedType;

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
