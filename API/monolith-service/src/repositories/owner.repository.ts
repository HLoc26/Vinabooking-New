import { PrismaClient, ERole, Prisma } from "@/generated/client";
import type { DynamicPricingSettings } from "@/types/pricing.types";
import { OwnerProfile, OwnerHoliday } from "@/models/owner";
import { OwnerMapper } from "@/mappers/owner.mapper";

class OwnerRepository {
	readonly #prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.#prisma = prisma;
	}

	public async findProfileByUserId(userId: string): Promise<OwnerProfile | null> {
		const profile = await this.#prisma.ownerProfile.findUnique({
			where: { userId },
			include: { ownerHolidays: true },
		});
		return profile ? OwnerMapper.toDomainProfile(profile) : null;
	}

	public async findProfileById(profileId: string): Promise<OwnerProfile | null> {
		const profile = await this.#prisma.ownerProfile.findUnique({
			where: { id: profileId },
			include: { ownerHolidays: true },
		});
		return profile ? OwnerMapper.toDomainProfile(profile) : null;
	}

	public async upgradeRoleAndCreateProfile(userId: string, data: { businessName: string; contactPhone: string; taxId?: string }): Promise<OwnerProfile> {
		const result = await this.#prisma.$transaction(async (tx) => {
			// 1. Tạo Profile
			const profile = await tx.ownerProfile.create({
				data: {
					userId: userId,
					businessName: data.businessName,
					contactPhone: data.contactPhone,
					taxId: data.taxId,
					isVerified: false,
				},
				include: { ownerHolidays: true },
			});

			// 2. Đổi Role
			await tx.user.update({
				where: { id: userId },
				data: { role: ERole.ACCOMMODATION_OWNER },
			});

			return profile;
		});
		return OwnerMapper.toDomainProfile(result);
	}

	public async saveProfile(profile: OwnerProfile): Promise<OwnerProfile> {
		const data = OwnerMapper.toPersistenceProfile(profile);
		
		const updated = await this.#prisma.ownerProfile.update({
			where: { id: profile.getId() },
			data: {
				businessName: data.businessName,
				taxId: data.taxId,
				contactPhone: data.contactPhone,
				isVerified: data.isVerified,
				dynamicPricingSettings: data.dynamicPricingSettings as any
			},
			include: { ownerHolidays: true },
		});
		return OwnerMapper.toDomainProfile(updated);
	}

	public async saveOwnerHolidays(profileId: string, holidays: OwnerHoliday[]): Promise<void> {
		await this.#prisma.$transaction(async (tx) => {
			// Xóa các holidays cũ
			await tx.ownerHoliday.deleteMany({
				where: { ownerProfileId: profileId }
			});

			if (holidays.length > 0) {
				const data = holidays.map(h => OwnerMapper.toPersistenceHoliday(h));
				await tx.ownerHoliday.createMany({
					data: data
				});
			}
		});
	}
}

export default OwnerRepository;

