import BadRequestError from "@/errors/BadRequestError";
import { OwnerRepository } from "@/repositories";
import { ERole } from "@/generated/client";

class OwnerService {
	readonly #ownerRepo: OwnerRepository;

	constructor(ownerRepo: OwnerRepository) {
		this.#ownerRepo = ownerRepo;
	}

	public async getOwnerProfile(userId: string) {
		return await this.#ownerRepo.findProfileByUserId(userId);
	}

	public async upgradeToOwner(userId: string, data: { businessName: string; contactPhone: string; taxId?: string }) {
		const user = await this.#ownerRepo.findUserWithProfile(userId);

		if (!user) {
			throw new BadRequestError("User not found");
		}

		if (user.role === ERole.ACCOMMODATION_OWNER || user.ownerProfile) {
			throw new BadRequestError("User is already an accommodation owner");
		}

		return await this.#ownerRepo.upgradeRoleAndCreateProfile(userId, data);
	}
}

export default OwnerService;
