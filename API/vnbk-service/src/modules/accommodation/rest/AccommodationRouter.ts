import { injectable } from "tsyringe";
import { BaseRouter } from "@/http/BaseRouter";
import { AccommodationController } from "@/modules/accommodation/rest/AccommodationController";
import { AuthGuard } from "@/http/middleware/AuthGuard";
import { ValidationPipe } from "@/http/middleware/ValidationPipe";
import { CreateAccommodationRequest } from "@/modules/accommodation/dto/request/CreateAccommodationRequest";
import { UpdateAccommodationRequest } from "@/modules/accommodation/dto/request/UpdateAccommodationRequest";
import { UpdateAddressRequest } from "@/modules/accommodation/dto/request/UpdateAddressRequest";
import { UpdateFacilitiesRequest } from "@/modules/accommodation/dto/request/UpdateFacilitiesRequest";
import { UpdateStatusRequest } from "@/modules/accommodation/dto/request/UpdateStatusRequest";
import { UpdatePricingSettingsRequest } from "@/modules/accommodation/dto/request/UpdatePricingSettingsRequest";
import { SearchAccommodationRequest } from "@/modules/accommodation/dto/request/SearchAccommodationRequest";
import { GetCountRequest } from "@/modules/accommodation/dto/request/GetCountRequest";
import { AccommodationIdsRequest } from "@/modules/accommodation/dto/request/AccommodationIdsRequest";

@injectable()
export class AccommodationRouter extends BaseRouter {
	constructor(
		private readonly controller: AccommodationController,
		private readonly auth: AuthGuard,
		private readonly validate: ValidationPipe
	) {
		super();
		this.registerRoutes();
	}

	public get basePath(): string {
		return "/accommodations";
	}

	protected registerRoutes(): void {
		// Specific GETs first so they win over the `/:id` catch-all.
		this.router.get("/stats", this.controller.getHomepageStats);
		this.router.get("/count", this.validate.query(GetCountRequest), this.controller.getCount);
		this.router.get("/search", this.validate.query(SearchAccommodationRequest), this.controller.search);

		// Batch fetch by id list (POST to avoid GET URL-length limits).
		this.router.post("/_mget", this.validate.body(AccommodationIdsRequest), this.controller.getBatch);

		// Owner-mutating routes (auth + owner-id check inside the service).
		this.router.post("/", this.auth.handle, this.validate.body(CreateAccommodationRequest), this.controller.create);
		this.router.patch("/:id/status", this.auth.handle, this.validate.body(UpdateStatusRequest), this.controller.updateStatus);
		this.router.patch("/:id/pricing-settings", this.auth.handle, this.validate.body(UpdatePricingSettingsRequest), this.controller.updatePricingSettings);
		this.router.post("/:id/publish", this.auth.handle, this.controller.publish);
		this.router.put("/:id/address", this.auth.handle, this.validate.body(UpdateAddressRequest), this.controller.updateAddress);
		this.router.put("/:id/facilities", this.auth.handle, this.validate.body(UpdateFacilitiesRequest), this.controller.updateFacilities);
		this.router.patch("/:id", this.auth.handle, this.validate.body(UpdateAccommodationRequest), this.controller.updateBasicInfo);

		// Public reads. Root handles `?byEntity=room&entityId=...`; `/:id` is the catch-all.
		this.router.get("/", this.controller.getByEntity);
		this.router.get("/:id", this.controller.getById);
	}
}
