import { PrismaClient, EAmenityType } from "@/generated/client";
import { Amenity, AmenityType } from "../models/amenity";
import { AmenityMapper } from "../mappers/amenity.mapper";

class AmenityRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}
	
	public async findAll(): Promise<Amenity[]> {
		const amenities = await this.#prismaClient.amenity.findMany({
			orderBy: { type: "asc" },
		});
		return amenities.map(a => AmenityMapper.toDomain(a));
	}

	public async findByType(type: AmenityType): Promise<Amenity[]> {
		const amenities = await this.#prismaClient.amenity.findMany({
			where: { type: type as unknown as EAmenityType },
		});
		return amenities.map(a => AmenityMapper.toDomain(a));
	}
	
	public async findById(id: string): Promise<Amenity | null> {
		const amenity = await this.#prismaClient.amenity.findUnique({
			where: { id }
		});
		if (!amenity) return null;
		return AmenityMapper.toDomain(amenity);
	}
	
	public async save(amenity: Amenity): Promise<void> {
		const persistenceModel = AmenityMapper.toPersistence(amenity);
		await this.#prismaClient.amenity.upsert({
			where: { id: persistenceModel.id },
			create: persistenceModel,
			update: persistenceModel
		});
	}
	
	public async deleteById(id: string): Promise<void> {
		await this.#prismaClient.amenity.delete({ where: { id } });
	}
}

export default AmenityRepository;
