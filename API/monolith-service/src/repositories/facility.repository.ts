import { PrismaClient } from "@generated/client";

class FacilityRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	public async findAll() {
		return await this.#prismaClient.facility.findMany();
	}
}

export default FacilityRepository;
