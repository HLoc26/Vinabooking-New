import { Request, Response } from "express";
import { AppError } from "@/errors";
import OwnerPricingService from "@/services/owner-pricing.service";
import PricingService from "@/services/pricing.service";
import ResponseHelper from "@/utils/response";
import type { DynamicPricingSettings, HolidayOptIn, QuoteRequest } from "@/types/pricing.types";

class PricingController {
	readonly #pricingService: PricingService;
	readonly #ownerPricingService: OwnerPricingService;

	constructor(pricingService: PricingService, ownerPricingService: OwnerPricingService) {
		this.#pricingService = pricingService;
		this.#ownerPricingService = ownerPricingService;
	}

	// ----- Public catalog -----

	public async getHolidayCatalog(_req: Request, res: Response) {
		try {
			const data = await this.#ownerPricingService.getHolidayCatalog();
			return ResponseHelper.success(res, data);
		} catch (err) {
			return this.#handle(err, res);
		}
	}

	// ----- Owner-wide settings -----

	public async getOwnerSettings(req: Request, res: Response) {
		try {
			const userId = req.userId!;
			const data = await this.#ownerPricingService.getSettingsByUser(userId);
			return ResponseHelper.success(res, data);
		} catch (err) {
			return this.#handle(err, res);
		}
	}

	public async updateOwnerSettings(req: Request, res: Response) {
		try {
			const userId = req.userId!;
			const body = req.body as DynamicPricingSettings | null;
			const data = await this.#ownerPricingService.updateSettingsByUser(userId, body ?? null);
			return ResponseHelper.success(res, data);
		} catch (err) {
			return this.#handle(err, res);
		}
	}

	// ----- Owner-wide holiday opt-ins -----

	public async getOwnerHolidays(req: Request, res: Response) {
		try {
			const userId = req.userId!;
			const data = await this.#ownerPricingService.getHolidayOptInsByUser(userId);
			return ResponseHelper.success(res, data);
		} catch (err) {
			return this.#handle(err, res);
		}
	}

	public async replaceOwnerHolidays(req: Request, res: Response) {
		try {
			const userId = req.userId!;
			const items = (req.body?.items ?? []) as HolidayOptIn[];
			const data = await this.#ownerPricingService.replaceHolidayOptInsByUser(userId, items);
			return ResponseHelper.success(res, data);
		} catch (err) {
			return this.#handle(err, res);
		}
	}

	public async syncAllAccommodations(req: Request, res: Response) {
		try {
			const userId = req.userId!;
			const data = await this.#ownerPricingService.forceApplyGlobalSettingsToAll(userId);
			return ResponseHelper.success(res, data);
		} catch (err) {
			return this.#handle(err, res);
		}
	}

	public async updateAccommodationFloorPrices(req: Request<{ id: string }>, res: Response) {
		try {
			const userId = req.userId!;
			const { id: accommodationId } = req.params;
			const { percent, minAmount } = req.body;
			const data = await this.#ownerPricingService.bulkUpdateRoomFloorPrices(userId, accommodationId, { percent, minAmount });
			return ResponseHelper.success(res, data);
		} catch (err) {
			return this.#handle(err, res);
		}
	}

	// ----- Quote (Phase 5 endpoint, controller method ready) -----

	public async quote(req: Request, res: Response) {
		try {
			const data = await this.#pricingService.quote(req.body as QuoteRequest);
			return ResponseHelper.success(res, data);
		} catch (err) {
			return this.#handle(err, res);
		}
	}

	#handle(err: unknown, res: Response) {
		if (err instanceof AppError) return ResponseHelper.error(res, err.message, err.statusCode);
		const e = err as Error;
		console.error("[PricingController]", e);
		return ResponseHelper.error(res, e.message || "Internal Server Error", 500);
	}
}

export default PricingController;
