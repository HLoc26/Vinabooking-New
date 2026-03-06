import { PrismaClient, ERole } from "@/generated/client";

class OwnerRepository {
	readonly #prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.#prisma = prisma;
	}

	public async findProfileByUserId(userId: string) {
		return await this.#prisma.ownerProfile.findUnique({
			where: { userId },
		});
	}

	public async findUserWithProfile(userId: string) {
		return await this.#prisma.user.findUnique({
			where: { id: userId },
			include: { ownerProfile: true },
		});
	}

	public async upgradeRoleAndCreateProfile(userId: string, data: { businessName: string; contactPhone: string; taxId?: string }) {
		return await this.#prisma.$transaction(async (tx) => {
			// 1. Tạo Profile
			const profile = await tx.ownerProfile.create({
				data: {
					userId: userId,
					businessName: data.businessName,
					contactPhone: data.contactPhone,
					taxId: data.taxId,
					isVerified: false,
				},
			});

			// 2. Đổi Role
			const user = await tx.user.update({
				where: { id: userId },
				data: { role: ERole.ACCOMMODATION_OWNER },
			});

			return { profile, user };
		});
	}
}

export default OwnerRepository;
