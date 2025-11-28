import prisma from "../prisma/client";

class FacilityRepository {
	public async findAll() {
		return prisma.facility.findMany();
	}
}

export const facilityRepository = new FacilityRepository();
