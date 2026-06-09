import { IsNumber, Min } from "class-validator";

/**
 * Request body for `POST /pricing/accommodations/:id/sync-floor-prices`.
 * floorPrice = min(max(basePrice * percent/100, minAmount), basePrice).
 */
export class BulkUpdateFloorPricesRequest {
	@IsNumber()
	@Min(0)
	percent!: number;

	@IsNumber()
	@Min(0)
	minAmount!: number;
}
