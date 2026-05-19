import BadRequestError from "@/errors/BadRequestError";
import { NotFoundError } from "@/errors";
import { OwnerRepository } from "@/repositories";
import { AccommodationService, BookingService, ImageService } from "@/services";
import { DraftAccommodation } from "@/types/accommodation.types";
import { EEntityType } from "@/generated/client";
import redisClient from "@/clients/redis.client";
import type { OwnerBookingFilters } from "@/repositories/booking.repository";

interface IWizardStepData {
	address: unknown;
	facilities: unknown[];
	rooms?: unknown[];
}

class OwnerService {
	readonly #ownerRepo: OwnerRepository;
	readonly #imageService: ImageService;
	readonly #accommodationService: AccommodationService;
	readonly #bookingService: BookingService;

	constructor(ownerRepo: OwnerRepository, imageService: ImageService, accommodationService: AccommodationService, bookingService: BookingService) {
		this.#ownerRepo = ownerRepo;
		this.#imageService = imageService;
		this.#accommodationService = accommodationService;
		this.#bookingService = bookingService;
	}

	public async getOwnerProfile(userId: string) {
		return await this.#ownerRepo.findProfileByUserId(userId);
	}

	public async getDraftAccommodations(ownerId: string): Promise<DraftAccommodation[]> {
		const accommodations = await this.#accommodationService.getDraftAccommodationsByOwner(ownerId);

		if (accommodations.length === 0) return [];

		const accIds = accommodations.map((acc) => acc.id);
		const allImages = await this.#imageService.getImagesBatch(EEntityType.ACCOMMODATION, accIds);

		const imageCountMap = new Map<string, number>();
		allImages.forEach((img) => {
			const ref = img.references?.[0];
			if (ref?.entityId) {
				const currentCount = imageCountMap.get(ref.entityId) || 0;
				imageCountMap.set(ref.entityId, currentCount + 1);
			}
		});

		const accommodationsWithSteps = accommodations.map((acc) => {
			const imageCount = imageCountMap.get(acc.id) || 0;
			const step = this.calculateWizardStep(acc, imageCount);
			return { ...acc, currentWizardStep: step };
		});

		return accommodationsWithSteps;
	}

	private calculateWizardStep(accommodation: IWizardStepData, imageCount: number): number {
		if (!accommodation.address) {
			return 1;
		}

		if (!accommodation.facilities || accommodation.facilities.length === 0) {
			return 2;
		}

		if (!accommodation.rooms || accommodation.rooms.length === 0) {
			return 3;
		}
		if (imageCount === 0) {
			return 4;
		}
		return 5;
	}

	public async getDraftForHydration(ownerId: string, accommodationId: string) {
		const accDetails = await this.#accommodationService.getOwnerDraftDetails(accommodationId, ownerId);
		if (!accDetails) {
			throw new NotFoundError("Draft accommodation not found or unauthorized access.");
		}

		const accommImages = await this.#imageService.getImagesBatch(EEntityType.ACCOMMODATION, [accommodationId]);
		const roomIds = accDetails.rooms.map((r) => r.id);
		const roomImages = roomIds.length > 0 ? await this.#imageService.getImagesBatch(EEntityType.ROOM, roomIds) : [];
		const formattedImages = [
			...accommImages.map((img) => ({ ...img, target: "accommodation" })),
			...roomImages.map((img) => {
				const ref = img.references?.[0];
				return { ...img, target: "room", roomId: ref?.entityId };
			}),
		];

		// Format amenities for the UI
		const formattedRooms = accDetails.rooms.map((room) => ({
			...room,
			amenities: room.amenities.map((a) => ({
				id: a.amenity.id,
				name: a.amenity.name,
				type: a.amenity.type,
				isAvailable: true,
			})),
		}));

		const currentWizardStep = this.calculateWizardStep(accDetails, accommImages.length);

		return {
			...accDetails,
			facilities: accDetails.facilities.map((f) => ({
				id: f.facilityId,
				name: f.facility.name,
				fee: f.fee,
				note: f.note,
			})),
			rooms: formattedRooms,
			currentWizardStep,
			images: formattedImages,
		};
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

	public async getBookings(ownerId: string, filters: OwnerBookingFilters) {
		return this.#bookingService.getOwnerBookings(ownerId, filters);
	}

	public async revokeBooking(ownerId: string, bookingId: string) {
		return this.#bookingService.revokeOwnerBooking(ownerId, bookingId);
	}
}

export default OwnerService;
