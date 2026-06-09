import { injectable } from "tsyringe";
import type { Prisma } from "@/generated/client";
import { Room } from "@/modules/room/domain/Room";
import { Bed } from "@/modules/room/domain/Bed";
import { Amenity } from "@/modules/room/domain/Amenity";
import { AmenityConfig } from "@/modules/room/domain/AmenityConfig";
import type { EBedType } from "@/modules/room/enums/EBedType";
import type { EViewType } from "@/modules/room/enums/EViewType";
import type { EPricingType } from "@/modules/room/enums/EPricingType";
import type { EAmenityType } from "@/modules/room/enums/EAmenityType";

/** A Room row joined to its beds and amenity configs (with the resolved amenity). */
type RoomWithDetails = Prisma.RoomGetPayload<{
	include: {
		beds: true;
		amenities: { include: { amenity: true } };
	};
}>;

type BedEntity = RoomWithDetails["beds"][number];
type AmenityConfigEntity = RoomWithDetails["amenities"][number];

/**
 * Maps the Prisma Room graph (beds + amenity configs) to the Room domain
 * aggregate. DAO-only; the sole place (besides the DAO) that touches
 * `@/generated/client`. Decimal columns (`size`, `basePrice`, `floorPrice`,
 * bed `price`) are converted to JS numbers so no Prisma type leaves the DAO.
 */
@injectable()
export class RoomEntityMapper {
	public toDomain(entity: RoomWithDetails): Room {
		return Room.rehydrate({
			id: entity.id,
			accommodationId: entity.accommodationId,
			name: entity.name,
			description: entity.description,
			quantity: entity.quantity,
			maxAdults: entity.maxAdults,
			maxChildren: entity.maxChildren,
			size: entity.size === null ? null : Number(entity.size),
			bedroomCount: entity.bedroomCount,
			bathroomCount: entity.bathroomCount,
			viewType: entity.viewType as EViewType,
			viewDescription: entity.viewDescription,
			basePrice: Number(entity.basePrice),
			floorPrice: Number(entity.floorPrice),
			pricingType: entity.pricingType as EPricingType,
			isActive: entity.isActive,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
			beds: entity.beds.map((bed) => this.bedToDomain(bed)),
			amenities: entity.amenities.map((config) => this.amenityConfigToDomain(config)),
		});
	}

	private bedToDomain(entity: BedEntity): Bed {
		return Bed.rehydrate({
			id: entity.id,
			roomId: entity.roomId,
			name: entity.name,
			description: entity.description,
			bedType: entity.bedType as EBedType,
			size: entity.size,
			quantity: entity.quantity,
			price: entity.price === null ? null : Number(entity.price),
			isActive: entity.isActive,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		});
	}

	private amenityConfigToDomain(entity: AmenityConfigEntity): AmenityConfig {
		const amenity = Amenity.rehydrate({
			id: entity.amenity.id,
			name: entity.amenity.name,
			type: entity.amenity.type as EAmenityType,
			description: entity.amenity.description,
		});
		return AmenityConfig.rehydrate({
			id: entity.id,
			roomId: entity.roomId,
			amenityId: entity.amenityId,
			note: entity.note,
			amenity,
		});
	}
}
