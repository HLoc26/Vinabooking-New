import BadRequestError from "@/errors/BadRequestError";
import { OwnerRepository } from "@/repositories";
import { AccommodationService, BookingService } from "@/services";
import { redisClient } from "@/registry";

class OwnerService {
	readonly #ownerRepo: OwnerRepository;
	readonly #accommodationService: AccommodationService;
	readonly #bookingService: BookingService;

	constructor(ownerRepo: OwnerRepository, accommodationService: AccommodationService, bookingService: BookingService) {
		this.#ownerRepo = ownerRepo;
		this.#accommodationService = accommodationService;
		this.#bookingService = bookingService;
	}

	public async getOwnerProfile(userId: string) {
		return await this.#ownerRepo.findProfileByUserId(userId);
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

		// 1. Gọi sang Accommodation để lấy sức chứa
		const capacity = await this.#accommodationService.getCapacityByOwnerId(ownerId);
		if (!capacity || capacity.roomIds.length === 0) {
			return { revenue: 0, occupancyRate: 0, pendingBookings: 0 };
		}

		// 2. Gọi sang Booking để lấy số liệu thống kê
		const stats = await this.#bookingService.getDashboardStatsByRoomIds(capacity.roomIds, startOfMonth);

		// 3. Tính Occupancy Rate
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
