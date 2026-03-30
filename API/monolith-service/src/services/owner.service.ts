import BadRequestError from "@/errors/BadRequestError";
import { AccommodationRepository, ImageRepository, OwnerRepository } from "@/repositories";
import { AccommodationService, BookingService } from "@/services";
import { AccommodationWithDetails, DraftAccommodation } from "@/types/accommodation.types";
import { EEntityType } from "@/generated/client";
import redisClient from "@/clients/redis.client";

class OwnerService {
	readonly #ownerRepo: OwnerRepository;
	readonly #accommodationRepo: AccommodationRepository;
	readonly #imageRepo: ImageRepository;
	readonly #accommodationService: AccommodationService;
	readonly #bookingService: BookingService;

	constructor(ownerRepo: OwnerRepository, accommodationRepo: AccommodationRepository, imageRepo: ImageRepository, accommodationService: AccommodationService, bookingService: BookingService) {
		this.#ownerRepo = ownerRepo;
		this.#accommodationRepo = accommodationRepo;
		this.#imageRepo = imageRepo;
		this.#accommodationService = accommodationService;
		this.#bookingService = bookingService;
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

	public async getDashboardStats(ownerId: string) {
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const passedDays = now.getDate() || 1;

		// 1. Fetch capacity from Accommodation
		const capacity = await this.#accommodationService.getCapacityByOwnerId(ownerId);
		if (!capacity || capacity.roomIds.length === 0) {
			return { revenue: 0, occupancyRate: 0, pendingBookings: 0 };
		}

		// 2. Fetch statistics from Booking
		const stats = await this.#bookingService.getDashboardStatsByRoomIds(capacity.roomIds, startOfMonth);

		// 3. Calculate Occupancy Rate
		const totalCapacity = capacity.totalRooms * passedDays;
		let occupancyRate = totalCapacity > 0 ? (stats.nightsSold / totalCapacity) * 100 : 0;
		if (occupancyRate > 100) occupancyRate = 100;

		return {
			revenue: stats.revenue,
			occupancyRate: Number(occupancyRate.toFixed(1)),
			pendingBookings: stats.pendingBookings,
		};
	}
}

export default OwnerService;
