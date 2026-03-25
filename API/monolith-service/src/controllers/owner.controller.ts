import { type Response, type Request } from "express";
import ResponseHelper from "@/utils/response";
import BadRequestError from "@/errors/BadRequestError";
import { OwnerService } from "@/services";
import { UpgradeOwnerRequest } from "@/types/requests";
import type { ApiResponse, OwnerProfileResponse, UpgradeOwnerResponse } from "@/types/responses";
import { DraftAccommodation } from "@/types/accommodation.types";

class OwnerController {
	readonly #ownerService: OwnerService;

	constructor(ownerService: OwnerService) {
		this.#ownerService = ownerService;
	}

	public async getMyProfile(req: Request, res: Response<ApiResponse<OwnerProfileResponse | null>>) {
		const userId = req.userId;

		if (!userId) throw new BadRequestError("Missing user identity");

		const profile = await this.#ownerService.getOwnerProfile(userId);
		return ResponseHelper.success<OwnerProfileResponse | null>(res, profile);
	}

	public async getDraftAccommodations(req: Request, res: Response<ApiResponse<DraftAccommodation[] | null>>) {
		const userId = req.userId;

		if (!userId) throw new BadRequestError("Missing user identity");

		const accommodations = await this.#ownerService.getDraftAccommodations(userId);
		return ResponseHelper.success<DraftAccommodation[] | null>(res, accommodations);
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
			profile: result.profile,
		});
	}
}

export default OwnerController;
