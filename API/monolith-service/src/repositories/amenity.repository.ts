import { PrismaClient, Amenity, EAmenityType } from "@/generated/client";

class AmenityRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}
	// Lấy tất cả tiện nghi để hiển thị dropdown khi tạo phòng
	public async findAll(): Promise<Amenity[]> {
		return await this.#prismaClient.amenity.findMany({
			orderBy: { type: "asc" },
		});
	}

	// Lấy tiện nghi theo loại (VD: chỉ lấy nhóm ENTERTAINMENT)
	public async findByType(type: EAmenityType): Promise<Amenity[]> {
		return await this.#prismaClient.amenity.findMany({
			where: { type },
		});
	}
}

export default AmenityRepository;
