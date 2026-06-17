import { Amenity as PrismaAmenity, EAmenityType } from "@/generated/client";
import { Amenity, AmenityType } from "@/models/amenity";

export class AmenityMapper {
    public static toDomain(prismaAmenity: PrismaAmenity): Amenity {
        return Amenity.builder()
            .setId(prismaAmenity.id)
            .setName(prismaAmenity.name)
            .setType(prismaAmenity.type as unknown as AmenityType)
            .setDescription(prismaAmenity.description)
            .setCreatedAt(prismaAmenity.createdAt)
            .setUpdatedAt(prismaAmenity.updatedAt)
            .build();
    }

    public static toPersistence(domainAmenity: Amenity): PrismaAmenity {
        return {
            id: domainAmenity.getId(),
            name: domainAmenity.getName(),
            type: domainAmenity.getType() as unknown as EAmenityType,
            description: domainAmenity.getDescription(),
            createdAt: domainAmenity.getCreatedAt(),
            updatedAt: domainAmenity.getUpdatedAt()
        };
    }
}
