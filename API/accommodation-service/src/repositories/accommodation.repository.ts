import prisma from "../prisma/client";
//import { AccommodationEntity } from "../types/accommodation";

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
}

// Singleton repository instance
export const accommodationRepository = new AccommodationRepository();