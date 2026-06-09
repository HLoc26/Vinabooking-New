import { inject, injectable } from "tsyringe";
import type { Request } from "express";
import { BaseController } from "@/http/BaseController";
import { PRICING_SERVICE, OWNER_PRICING_SERVICE } from "@/modules/pricing/pricing.tokens";
import type { IPricingService } from "@/modules/pricing/service/IPricingService";
import type { IOwnerPricingService } from "@/modules/pricing/service/IOwnerPricingService";
import { PricingDtoMapper } from "@/modules/pricing/rest/mapper/PricingDtoMapper";
import type { QuoteRequest } from "@/modules/pricing/dto/request/QuoteRequest";
import type { UpdateOwnerSettingsRequest } from "@/modules/pricing/dto/request/UpdateOwnerSettingsRequest";
import type { ReplaceHolidayOptInsRequest } from "@/modules/pricing/dto/request/ReplaceHolidayOptInsRequest";
import type { BulkUpdateFloorPricesRequest } from "@/modules/pricing/dto/request/BulkUpdateFloorPricesRequest";
import type { QuoteResponse } from "@/modules/pricing/dto/response/QuoteResponse";
import type { HolidayResponse } from "@/modules/pricing/dto/response/HolidayResponse";
import type { HolidayOptInResponse } from "@/modules/pricing/dto/response/HolidayOptInResponse";
import type { OwnerSettingsResponse } from "@/modules/pricing/dto/response/OwnerSettingsResponse";
import type { UpdatedCountResponse } from "@/modules/pricing/dto/response/UpdatedCountResponse";
import { BadRequestError } from "@/shared/error/BadRequestError";

@injectable()
export class PricingController extends BaseController {
	constructor(
		@inject(PRICING_SERVICE) private readonly pricingService: IPricingService,
		@inject(OWNER_PRICING_SERVICE) private readonly ownerPricingService: IOwnerPricingService,
		private readonly mapper: PricingDtoMapper
	) {
		super();
	}

	// ----- Public -----

	public getHolidayCatalog = this.handle<HolidayResponse[]>(async () => {
		const holidays = await this.ownerPricingService.getHolidayCatalog();
		return this.ok(this.mapper.toHolidayResponses(holidays));
	});

	public quote = this.handle<QuoteResponse>(async (req: Request) => {
		const dto = req.validatedBody as QuoteRequest;
		const quote = await this.pricingService.quote(dto);
		return this.ok(quote);
	});

	// ----- Owner-wide settings -----

	public getOwnerSettings = this.handle<OwnerSettingsResponse>(async (req: Request) => {
		const userId = this.requireUserId(req);
		const settings = await this.ownerPricingService.getSettingsByUser(userId);
		return this.ok(this.mapper.toOwnerSettingsResponse(settings));
	});

	public updateOwnerSettings = this.handle<OwnerSettingsResponse>(async (req: Request) => {
		const userId = this.requireUserId(req);
		const dto = req.validatedBody as UpdateOwnerSettingsRequest;
		const settings = await this.ownerPricingService.updateSettingsByUser(userId, dto);
		return this.ok(this.mapper.toOwnerSettingsResponse(settings));
	});

	// ----- Owner-wide holiday opt-ins -----

	public getOwnerHolidays = this.handle<HolidayOptInResponse[]>(async (req: Request) => {
		const userId = this.requireUserId(req);
		const optIns = await this.ownerPricingService.getHolidayOptInsByUser(userId);
		return this.ok(this.mapper.toHolidayOptInResponses(optIns));
	});

	public replaceOwnerHolidays = this.handle<HolidayOptInResponse[]>(async (req: Request) => {
		const userId = this.requireUserId(req);
		const dto = req.validatedBody as ReplaceHolidayOptInsRequest;
		const optIns = await this.ownerPricingService.replaceHolidayOptInsByUser(userId, dto.items);
		return this.ok(this.mapper.toHolidayOptInResponses(optIns));
	});

	// ----- Bulk owner actions -----

	public syncAllAccommodations = this.handle<UpdatedCountResponse>(async (req: Request) => {
		const userId = this.requireUserId(req);
		const updatedCount = await this.ownerPricingService.forceApplyGlobalSettingsToAll(userId);
		return this.ok({ updatedCount });
	});

	public updateAccommodationFloorPrices = this.handle<UpdatedCountResponse>(async (req: Request) => {
		const userId = this.requireUserId(req);
		const accommodationId = req.params.id;
		if (!accommodationId || typeof accommodationId !== "string") {
			throw new BadRequestError("Missing accommodation id parameter");
		}
		const dto = req.validatedBody as BulkUpdateFloorPricesRequest;
		const updatedCount = await this.ownerPricingService.bulkUpdateRoomFloorPrices(userId, accommodationId, dto);
		return this.ok({ updatedCount });
	});
}
