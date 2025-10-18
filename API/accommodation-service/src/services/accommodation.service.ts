import prisma from "../utils/prisma.js";

export async function findAccommodationById(id: string) {
    return prisma.accommodation.findUnique({
        where: { id },
        include: {
            address: true,
            facilities: {
                include: { facility: true },
            },
        },
    });
}
