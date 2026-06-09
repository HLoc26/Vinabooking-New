import { ArrayMinSize, IsArray, IsString } from "class-validator";

/**
 * Request body for `POST /accommodations/_mget`. Batch-fetch many accommodations
 * by id (POST is used because the id list can exceed a GET URL length limit).
 */
export class AccommodationIdsRequest {
	@IsArray()
	@ArrayMinSize(1)
	@IsString({ each: true })
	ids!: string[];
}
