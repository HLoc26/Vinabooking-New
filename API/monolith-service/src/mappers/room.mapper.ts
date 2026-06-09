import { Room as PrismaRoom, Bed as PrismaBed, AmenityConfig as PrismaAmenityConfig, Amenity as PrismaAmenity, Prisma } from "@/generated/client";
import { Room } from "@/models/room/room.model";
import { Bed } from "@/models/room/bed.model";
import { AmenityConfig } from "@/models/room/amenity-config.model";

type PrismaRoomWithDetails = PrismaRoom & {
	beds: PrismaBed[];
	amenities: (PrismaAmenityConfig & { amenity?: PrismaAmenity })[];
};

export class RoomMapper {
	public static toDomain(prismaRoom: PrismaRoomWithDetails): Room {
		const beds = prismaRoom.beds.map(bed => RoomMapper.toBedDomain(bed));
		const amenities = prismaRoom.amenities.map(amenity => RoomMapper.toAmenityConfigDomain(amenity));

		return Room.builder()
			.setId(prismaRoom.id)
			.setAccommodationId(prismaRoom.accommodationId)
			.setName(prismaRoom.name)
			.setDescription(prismaRoom.description)
			.setQuantity(prismaRoom.quantity)
			.setCapacity(prismaRoom.maxAdults, prismaRoom.maxChildren)
			.setDimensions(prismaRoom.size ? Number(prismaRoom.size) : null, prismaRoom.bedroomCount, prismaRoom.bathroomCount)
			.setView(prismaRoom.viewType, prismaRoom.viewDescription)
			.setPricing(Number(prismaRoom.basePrice), Number(prismaRoom.floorPrice), prismaRoom.pricingType)
			.setIsActive(prismaRoom.isActive)
			.setTimestamps(prismaRoom.createdAt, prismaRoom.updatedAt)
			.setBeds(beds)
			.setAmenities(amenities)
			.build();
	}

	public static toBedDomain(prismaBed: PrismaBed): Bed {
		return Bed.builder()
			.setId(prismaBed.id)
			.setRoomId(prismaBed.roomId)
			.setName(prismaBed.name)
			.setDescription(prismaBed.description)
			.setBedType(prismaBed.bedType)
			.setSize(prismaBed.size)
			.setPersistedQuantity(prismaBed.quantity)
			.setPrice(prismaBed.price ? Number(prismaBed.price) : null)
			.setIsActive(prismaBed.isActive)
			.setTimestamps(prismaBed.createdAt, prismaBed.updatedAt)
			.build();
	}

	public static toAmenityConfigDomain(prismaAmenityConfig: PrismaAmenityConfig & { amenity?: PrismaAmenity }): AmenityConfig {
		const builder = AmenityConfig.builder()
			.setId(prismaAmenityConfig.id)
			.setRoomId(prismaAmenityConfig.roomId)
			.setAmenityId(prismaAmenityConfig.amenityId)
			.setNote(prismaAmenityConfig.note)
			.setTimestamps(prismaAmenityConfig.createdAt, prismaAmenityConfig.updatedAt);

		if (prismaAmenityConfig.amenity) {
			builder.setAmenityDetails(
				prismaAmenityConfig.amenity.name,
				prismaAmenityConfig.amenity.type,
				prismaAmenityConfig.amenity.description
			);
		}

		return builder.build();
	}

	public static toPersistenceCreate(domainRoom: Room): Prisma.RoomCreateInput {
		return {
			id: domainRoom.getId(),
			accommodation: { connect: { id: domainRoom.getAccommodationId() } },
			name: domainRoom.getName(),
			description: domainRoom.getDescription(),
			quantity: domainRoom.getQuantity(),
			maxAdults: domainRoom.getMaxAdults(),
			maxChildren: domainRoom.getMaxChildren(),
			size: domainRoom.getSize() ? new Prisma.Decimal(domainRoom.getSize()!) : null,
			bedroomCount: domainRoom.getBedroomCount(),
			bathroomCount: domainRoom.getBathroomCount(),
			viewType: domainRoom.getViewType(),
			viewDescription: domainRoom.getViewDescription(),
			basePrice: new Prisma.Decimal(domainRoom.getBasePrice()),
			floorPrice: new Prisma.Decimal(domainRoom.getFloorPrice()),
			pricingType: domainRoom.getPricingType(),
			isActive: domainRoom.getIsActive(),
			beds: {
				create: domainRoom.getBeds().map(bed => ({
					id: bed.getId(),
					name: bed.getName(),
					description: bed.getDescription(),
					bedType: bed.getBedType(),
					size: bed.getSize(),
					quantity: bed.getQuantity(),
					price: bed.getPrice() ? new Prisma.Decimal(bed.getPrice()!) : null,
					isActive: bed.getIsActive()
				}))
			},
			amenities: {
				create: domainRoom.getAmenities().map(config => ({
					id: config.getId(),
					note: config.getNote(),
					amenityId: config.getAmenityId()
				}))
			}
		};
	}
}
