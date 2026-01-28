import { PrismaClient, Facility } from "@generated/client";

class FacilityRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	public async findAll(): Promise<Facility[]> {
		return await this.#prismaClient.facility.findMany();
	}
}

export default FacilityRepository;
