import { IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { LongStayConfigRequest } from "@/modules/pricing/dto/request/LongStayConfigRequest";
import { EarlyBirdConfigRequest } from "@/modules/pricing/dto/request/EarlyBirdConfigRequest";

/** Request body for `PATCH /pricing/owners/me/settings`. */
export class UpdateOwnerSettingsRequest {
	@IsOptional()
	@ValidateNested()
	@Type(() => LongStayConfigRequest)
	longStayConfig?: LongStayConfigRequest;

	@IsOptional()
	@ValidateNested()
	@Type(() => EarlyBirdConfigRequest)
	earlyBirdConfig?: EarlyBirdConfigRequest;
}
