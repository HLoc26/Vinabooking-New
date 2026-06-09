import { IsEnum } from "class-validator";
import { EAccommodationStatus } from "@/modules/accommodation/enums/EAccommodationStatus";

/** Request body for `PATCH /accommodations/:id/status`. */
export class UpdateStatusRequest {
	@IsEnum(EAccommodationStatus)
	status!: EAccommodationStatus;
}
