import { type Response, type Request } from "express";
import ResponseHelper from "@/utils/response";
import BadRequestError from "@/errors/BadRequestError";
import { OwnerService } from "@/services";
import { OwnerMapper } from "@/mappers/owner.mapper";
import { UpgradeOwnerRequest } from "@/types/requests";
import type { ApiResponse, OwnerProfileResponse, UpgradeOwnerResponse, DashboardStatsResponse } from "@/types/responses";
import { DraftAccommodation } from "@/dto/response/accommodation.dto";
import type { OwnerBookingFilters, OwnerBookingSort, OwnerBookingStatus } from "@/repositories/booking.repository";

class OwnerController {
	readonly #ownerService: OwnerService;

	constructor(ownerService: OwnerService) {
		this.#ownerService = ownerService;
	}

	public async getMyProfile(req: Request, res: Response<ApiResponse<OwnerProfileResponse | null>>) {
		const userId = req.userId;

		if (!userId) throw new BadRequestError("Missing user identity");

		const profile = await this.#ownerService.getOwnerProfile(userId);
		return ResponseHelper.success<OwnerProfileResponse | null>(res, profile ? OwnerMapper.toResponseDto(profile) : null);
	}

	public async getDraftAccommodations(req: Request, res: Response<ApiResponse<DraftAccommodation[] | null>>) {
		const userId = req.userId;

		if (!userId) throw new BadRequestError("Missing user identity");

		const accommodations = await this.#ownerService.getDraftAccommodations(userId);
		return ResponseHelper.success<DraftAccommodation[] | null>(res, accommodations);
	}

	public async getAccommodationDetail(req: Request<{ id: string }>, res: Response) {
		const userId = req.userId;
		const { id } = req.params;

		if (!userId) throw new BadRequestError("Missing user identity");

		const draftDetail = await this.#ownerService.getDraftForHydration(userId, id);

		return ResponseHelper.success(res, draftDetail);
	}

	public async upgradeRole(req: UpgradeOwnerRequest, res: Response<ApiResponse<UpgradeOwnerResponse>>) {
		const userId = req.userId;
		const { businessName, contactPhone, taxId } = req.body;

		if (!userId) throw new BadRequestError("Missing user identity");
		if (!businessName) throw new BadRequestError("Missing business name");
		if (!contactPhone) throw new BadRequestError("Missing contact phone");

		const result = await this.#ownerService.upgradeToOwner(userId, {
			businessName,
			contactPhone,
			taxId,
		});

		return ResponseHelper.success<UpgradeOwnerResponse>(res, {
			user: {
				id: result.user.id,
				email: result.user.email,
				role: result.user.role,
			},
			profile: OwnerMapper.toResponseDto(result.profile),
		});
	}

	public async getDashboardStats(req: Request, res: Response<ApiResponse<DashboardStatsResponse>>) {
		const userId = req.userId;
		if (!userId) throw new BadRequestError("Missing user identity");

		const stats = await this.#ownerService.getDashboardStats(userId);
		return ResponseHelper.success<DashboardStatsResponse>(res, stats);
	}

	public async getBookings(req: Request, res: Response) {
		const userId = req.userId;
		if (!userId) throw new BadRequestError("Missing user identity");

		const { status, accommodationId, fromDay, toDay, sort } = req.query;
		const filters: OwnerBookingFilters = {
			status: status as OwnerBookingStatus | undefined,
			accommodationId: accommodationId as string | undefined,
			fromDay: fromDay as string | undefined,
			toDay: toDay as string | undefined,
			sort: sort as OwnerBookingSort | undefined,
		};

		const bookings = await this.#ownerService.getBookings(userId, filters);
		return ResponseHelper.success(res, bookings);
	}

	public async revokeBooking(req: Request<{ bookingId: string }>, res: Response) {
		const userId = req.userId;
		if (!userId) throw new BadRequestError("Missing user identity");

		const { note } = req.body as { note?: string };
		const result = await this.#ownerService.revokeBooking(userId, req.params.bookingId, note);
		return ResponseHelper.success(res, result);
	}
}

export default OwnerController;
