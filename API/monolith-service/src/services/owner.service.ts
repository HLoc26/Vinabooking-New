import BadRequestError from "@/errors/BadRequestError";
import { AccommodationRepository, ImageRepository, OwnerRepository } from "@/repositories";
import { AccommodationWithDetails, DraftAccommodation } from "@/types/accommodation.types";
import { EEntityType } from "@/generated/client";
import redisClient from "@/clients/redis.client";

class OwnerService {
	readonly #ownerRepo: OwnerRepository;
	readonly #accommodationRepo: AccommodationRepository;
	readonly #imageRepo: ImageRepository;

	constructor(ownerRepo: OwnerRepository, accommodationRepo: AccommodationRepository, imageRepo: ImageRepository) {
		this.#ownerRepo = ownerRepo;
		this.#accommodationRepo = accommodationRepo;
		this.#imageRepo = imageRepo;
	}

	public async getOwnerProfile(userId: string) {
		return await this.#ownerRepo.findProfileByUserId(userId);
	}

	public async getDraftAccommodations(ownerId: string): Promise<DraftAccommodation[]> {
		const accommodations = await this.#accommodationRepo.findDraftByOwnerId(ownerId);
		const accommodationsWithSteps = await Promise.all(
			accommodations.map(async (acc) => {
				const step = await this.calculateWizardStep(acc);
				return { ...acc, currentWizardStep: step };
			})
		);
		return accommodationsWithSteps;
	}

	private async calculateWizardStep(accommodation: AccommodationWithDetails): Promise<number> {
		if (!accommodation.address) {
			return 1;
		}

		if (accommodation.facilities.length === 0) {
			return 2;
		}

		// @ts-ignore
		if (!accommodation.rooms || accommodation.rooms.length === 0) {
			return 3;
		}

		const imageCount = await this.#imageRepo.countByEntity(accommodation.id, EEntityType.ACCOMMODATION);
		if (imageCount === 0) {
			return 4;
		}
		return 5;
	}

	public async upgradeToOwner(userId: string, data: { businessName: string; contactPhone: string; taxId?: string }) {
		const user = await this.#ownerRepo.findUserWithProfile(userId);

		if (!user) {
			throw new BadRequestError("User not found");
		}

		if (user.ownerProfile) {
			throw new BadRequestError("Owner profile already exists for this user");
		}

		const result = await this.#ownerRepo.upgradeRoleAndCreateProfile(userId, data);

		// --- CACHE INVALIDATION ---
		try {
			const cacheKey = `user:${userId}:role`;
			await redisClient.del(cacheKey);
		} catch (redisErr) {
			console.error(`[Redis] Failed to delete role cache for user ${userId} after upgrade:`, redisErr);
		}

		return result;
	}
}

export default OwnerService;
