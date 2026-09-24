import { PrismaClient } from "@/generated/client";
import { Facility } from "@/models/facility";
import { FacilityMapper } from "@/mappers/facility.mapper";

class FacilityRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	public async findAll(): Promise<Facility[]> {
		const facilities = await this.#prismaClient.facility.findMany();
		return facilities.map(f => FacilityMapper.toDomain(f));
	}

	public async findById(id: string): Promise<Facility | null> {
		const facility = await this.#prismaClient.facility.findUnique({ where: { id } });
		if (!facility) return null;
		return FacilityMapper.toDomain(facility);
	}

	public async save(facility: Facility): Promise<void> {
		const persistenceModel = FacilityMapper.toPersistence(facility);

		await this.#prismaClient.facility.upsert({
			where: { id: persistenceModel.id },
			create: persistenceModel,
			update: persistenceModel
		});
	}

	public async deleteById(id: string): Promise<void> {
		await this.#prismaClient.facility.delete({ where: { id } });
	}
}

export default FacilityRepository;
