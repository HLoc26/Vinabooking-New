import prisma from "../prisma/client";
//import { AccommodationEntity } from "../types/accommodation";
import { Prisma, EAccommodationType } from "@prisma/client";

export interface SearchFilters {
	keyword?: string;
	type?: EAccommodationType;
	ids?: string[]; // List ID từ room-service
	facilities?: string[];
}

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

	async search(filters: SearchFilters, offset: number, limit: number, sortBy: string = "newest") {
		const where: Prisma.AccommodationWhereInput = {
			isActive: true,
		};

		// 1. Keyword: Tìm theo Tên HOẶC Thành phố HOẶC Địa chỉ đầy đủ
		if (filters.keyword) {
			where.OR = [{ name: { contains: filters.keyword } }, { address: { city: { contains: filters.keyword } } }, { address: { fullAddress: { contains: filters.keyword } } }];
		}

		// 2. Type
		if (filters.type) {
			where.type = filters.type;
		}

		// 3. IDs (Lọc giá/người)
		if (filters.ids !== undefined) {
			// Nếu mảng ID rỗng (tức là filter giá/người không tìm thấy gì) -> Trả về rỗng luôn
			if (filters.ids.length === 0) {
				return { data: [], total: 0 };
			}
			where.id = { in: filters.ids };
		}

		// 4. Facilities
		if (filters.facilities && filters.facilities.length > 0) {
			where.facilities = {
				some: {
					facility: { name: { in: filters.facilities } },
				},
			};
		}

		// 5. Sort
		let orderBy: Prisma.AccommodationOrderByWithRelationInput = { createdAt: "desc" };
		if (sortBy === "name_asc") orderBy = { name: "asc" };
		else if (sortBy === "name_desc") orderBy = { name: "desc" };

		// Execute query
		const [data, total] = await Promise.all([
			prisma.accommodation.findMany({
				where,
				include: { address: true },
				skip: offset,
				take: limit,
				orderBy,
			}),
			prisma.accommodation.count({ where }),
		]);

		return { data, total };
	}
}

// Singleton repository instance
export const accommodationRepository = new AccommodationRepository();
