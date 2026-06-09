import { Facility as PrismaFacility, EFacilityType } from "@/generated/client";
import { Facility, FacilityType } from "@/models/facility";

export class FacilityMapper {
    public static toDomain(prismaFacility: PrismaFacility): Facility {
        return Facility.builder()
            .setId(prismaFacility.id)
            .setName(prismaFacility.name)
            .setType(prismaFacility.type as unknown as FacilityType)
            .setDescription(prismaFacility.description)
            .setCreatedAt(prismaFacility.createdAt)
            .setUpdatedAt(prismaFacility.updatedAt)
            .build();
    }

    public static toPersistence(domainFacility: Facility): PrismaFacility {
        return {
            id: domainFacility.getId(),
            name: domainFacility.getName(),
            type: domainFacility.getType() as unknown as EFacilityType,
            description: domainFacility.getDescription(),
            createdAt: domainFacility.getCreatedAt(),
            updatedAt: domainFacility.getUpdatedAt()
        };
    }
}
