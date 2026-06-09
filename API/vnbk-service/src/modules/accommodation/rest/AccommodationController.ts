import { inject, injectable } from "tsyringe";
import type { Request } from "express";
import { BaseController } from "@/http/BaseController";
import { ACCOMMODATION_SERVICE } from "@/modules/accommodation/accommodation.tokens";
import type { IAccommodationService } from "@/modules/accommodation/service/IAccommodationService";
import type { AccommodationResponse } from "@/modules/accommodation/dto/response/AccommodationResponse";
import type { AccommodationSearchResponse } from "@/modules/accommodation/dto/response/AccommodationSearchResponse";
import type { AccommodationCountResponse } from "@/modules/accommodation/dto/response/AccommodationCountResponse";
import type { HomepageStatsResponse } from "@/modules/accommodation/dto/response/HomepageStatsResponse";
import type { CreateAccommodationRequest } from "@/modules/accommodation/dto/request/CreateAccommodationRequest";
import type { UpdateAccommodationRequest } from "@/modules/accommodation/dto/request/UpdateAccommodationRequest";
import type { UpdateAddressRequest } from "@/modules/accommodation/dto/request/UpdateAddressRequest";
import type { UpdateFacilitiesRequest } from "@/modules/accommodation/dto/request/UpdateFacilitiesRequest";
import type { UpdateStatusRequest } from "@/modules/accommodation/dto/request/UpdateStatusRequest";
import type { UpdatePricingSettingsRequest } from "@/modules/accommodation/dto/request/UpdatePricingSettingsRequest";
import type { SearchAccommodationRequest } from "@/modules/accommodation/dto/request/SearchAccommodationRequest";
import type { GetCountRequest } from "@/modules/accommodation/dto/request/GetCountRequest";
import type { AccommodationIdsRequest } from "@/modules/accommodation/dto/request/AccommodationIdsRequest";
import { BadRequestError } from "@/shared/error/BadRequestError";

@injectable()
export class AccommodationController extends BaseController {
	constructor(@inject(ACCOMMODATION_SERVICE) private readonly accommodationService: IAccommodationService) {
		super();
	}

	// --- Public reads ---

	public getHomepageStats = this.handle<HomepageStatsResponse>(async () => {
		const stats = await this.accommodationService.getHomepageStats();
		return this.ok(stats);
	});

	public getCount = this.handle<AccommodationCountResponse>(async (req: Request) => {
		const query = req.validatedQuery as GetCountRequest;
		const result = await this.accommodationService.getCount(query.city, query.type);
		return this.ok(result);
	});

	public search = this.handle<AccommodationSearchResponse>(async (req: Request) => {
		const query = req.validatedQuery as SearchAccommodationRequest;
		const result = await this.accommodationService.search(query);
		return this.ok(result);
	});

	/** GET /accommodations?byEntity=room&entityId=:roomId — resolve an accommodation from a room. */
	public getByEntity = this.handle<AccommodationResponse>(async (req: Request) => {
		const { byEntity, entityId } = req.query;
		if (byEntity === "room" && typeof entityId === "string" && entityId.length > 0) {
			const accommodation = await this.accommodationService.getAccommodationByRoomId(entityId);
			return this.ok(accommodation);
		}
		throw new BadRequestError("Invalid query parameters");
	});

	public getBatch = this.handle<AccommodationResponse[]>(async (req: Request) => {
		const dto = req.validatedBody as AccommodationIdsRequest;
		const accommodations = await this.accommodationService.getBatch(dto.ids);
		return this.ok(accommodations);
	});

	public getById = this.handle<AccommodationResponse>(async (req: Request) => {
		const id = this.param(req, "id");
		const accommodation = await this.accommodationService.getById(id);
		return this.ok(accommodation);
	});

	// --- Owner mutations ---

	public create = this.handle<AccommodationResponse>(async (req: Request) => {
		const ownerId = this.requireUserId(req);
		const dto = req.validatedBody as CreateAccommodationRequest;
		const accommodation = await this.accommodationService.create(ownerId, dto);
		return this.created(accommodation);
	});

	public updateBasicInfo = this.handle<AccommodationResponse>(async (req: Request) => {
		const ownerId = this.requireUserId(req);
		const id = this.param(req, "id");
		const dto = req.validatedBody as UpdateAccommodationRequest;
		const accommodation = await this.accommodationService.updateBasicInfo(ownerId, id, dto);
		return this.ok(accommodation);
	});

	public updateAddress = this.handle<AccommodationResponse>(async (req: Request) => {
		const ownerId = this.requireUserId(req);
		const id = this.param(req, "id");
		const dto = req.validatedBody as UpdateAddressRequest;
		const accommodation = await this.accommodationService.updateAddress(ownerId, id, dto);
		return this.ok(accommodation);
	});

	public updateFacilities = this.handle<AccommodationResponse>(async (req: Request) => {
		const ownerId = this.requireUserId(req);
		const id = this.param(req, "id");
		const dto = req.validatedBody as UpdateFacilitiesRequest;
		const accommodation = await this.accommodationService.updateFacilities(ownerId, id, dto);
		return this.ok(accommodation);
	});

	public updateStatus = this.handle<AccommodationResponse>(async (req: Request) => {
		const ownerId = this.requireUserId(req);
		const id = this.param(req, "id");
		const dto = req.validatedBody as UpdateStatusRequest;
		const accommodation = await this.accommodationService.updateStatus(ownerId, id, dto.status);
		return this.ok(accommodation);
	});

	public updatePricingSettings = this.handle<AccommodationResponse>(async (req: Request) => {
		const ownerId = this.requireUserId(req);
		const id = this.param(req, "id");
		const dto = req.validatedBody as UpdatePricingSettingsRequest;
		const accommodation = await this.accommodationService.updatePricingSettings(ownerId, id, dto);
		return this.ok(accommodation);
	});

	public publish = this.handle<AccommodationResponse>(async (req: Request) => {
		const ownerId = this.requireUserId(req);
		const id = this.param(req, "id");
		const accommodation = await this.accommodationService.publish(ownerId, id);
		return this.ok(accommodation);
	});

	// --- Helpers ---

	/** Reads a required path param as a single string, or throws 400. */
	private param(req: Request, name: string): string {
		const value = req.params[name];
		if (typeof value !== "string" || value.length === 0) {
			throw new BadRequestError(`Missing ${name} parameter`);
		}
		return value;
	}
}
