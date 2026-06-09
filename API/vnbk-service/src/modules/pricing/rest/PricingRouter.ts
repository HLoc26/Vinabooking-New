import { injectable } from "tsyringe";
import { BaseRouter } from "@/http/BaseRouter";
import { PricingController } from "@/modules/pricing/rest/PricingController";
import { AuthGuard } from "@/http/middleware/AuthGuard";
import { ValidationPipe } from "@/http/middleware/ValidationPipe";
import { QuoteRequest } from "@/modules/pricing/dto/request/QuoteRequest";
import { UpdateOwnerSettingsRequest } from "@/modules/pricing/dto/request/UpdateOwnerSettingsRequest";
import { ReplaceHolidayOptInsRequest } from "@/modules/pricing/dto/request/ReplaceHolidayOptInsRequest";
import { BulkUpdateFloorPricesRequest } from "@/modules/pricing/dto/request/BulkUpdateFloorPricesRequest";

@injectable()
export class PricingRouter extends BaseRouter {
	constructor(
		private readonly controller: PricingController,
		private readonly auth: AuthGuard,
		private readonly validate: ValidationPipe
	) {
		super();
		this.registerRoutes();
	}

	public get basePath(): string {
		return "/pricing";
	}

	protected registerRoutes(): void {
		// Public
		this.router.get("/holidays", this.controller.getHolidayCatalog);
		this.router.post("/quote", this.validate.body(QuoteRequest), this.controller.quote);

		// Owner-wide settings (auth-protected)
		this.router.get("/owners/me/settings", this.auth.handle, this.controller.getOwnerSettings);
		this.router.patch("/owners/me/settings", this.auth.handle, this.validate.body(UpdateOwnerSettingsRequest), this.controller.updateOwnerSettings);

		// Owner-wide holiday opt-ins
		this.router.get("/owners/me/holidays", this.auth.handle, this.controller.getOwnerHolidays);
		this.router.put("/owners/me/holidays", this.auth.handle, this.validate.body(ReplaceHolidayOptInsRequest), this.controller.replaceOwnerHolidays);

		// Bulk owner actions
		this.router.post("/owners/me/sync-accommodations", this.auth.handle, this.controller.syncAllAccommodations);
		this.router.post("/accommodations/:id/sync-floor-prices", this.auth.handle, this.validate.body(BulkUpdateFloorPricesRequest), this.controller.updateAccommodationFloorPrices);
	}
}
