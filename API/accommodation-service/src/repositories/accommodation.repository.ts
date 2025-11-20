import prisma from "../prisma/client";
//import { AccommodationEntity } from "../types/accommodation";
import { Prisma, EAccommodationType } from "@prisma/client";

export class AccommodationRepository {
	async findById(id: string) {
		return prisma.accommodation.findUnique({
			where: { id },
			include: {
				address: true,
				facilities: { include: { facility: true } },
			},
		});
	}

	async countByType() {
		return prisma.accommodation.groupBy({
			by: ["type"],
			where: {
				isActive: true,
			},
			_count: {
				id: true, // Đếm số bản ghi
			},
			orderBy: {
				_count: {
					id: "desc", // <--- Sắp xếp từ LỚN đến BÉ
				},
			},
		});
	}

	async countByCity() {
		return prisma.address.groupBy({
			by: ["city"],
			where: {
				accommodation: {
					isActive: true, // Chỉ đếm các accommodation đang hoạt động
				},
			},
			_count: {
				id: true,
			},
			orderBy: {
				_count: {
					id: "desc", // <--- Sắp xếp từ LỚN đến BÉ
				},
			},
			take: 20, // <--- GIỚI HẠN: Chỉ lấy 20 thành phố cao nhất
		});
	}

	// Count accommodations with city and type filters
	async count(filters: { city?: string; type?: EAccommodationType }) {
		const where: Prisma.AccommodationWhereInput = {
			isActive: true,
		};

		if (filters.type) {
			where.type = filters.type;
		}

		if (filters.city) {
			where.address = {
				city: {
					contains: filters.city,
				},
			};
		}

		return prisma.accommodation.count({
			where,
		});
	}
}

// Singleton repository instance
export const accommodationRepository = new AccommodationRepository();
