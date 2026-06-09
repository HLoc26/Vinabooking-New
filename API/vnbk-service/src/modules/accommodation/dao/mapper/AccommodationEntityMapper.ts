import { injectable } from "tsyringe";
import type { Prisma } from "@/generated/client";
import { Accommodation } from "@/modules/accommodation/domain/Accommodation";
import { Address } from "@/modules/accommodation/domain/Address";
import { Facility } from "@/modules/accommodation/domain/Facility";
import { FacilityConfig } from "@/modules/accommodation/domain/FacilityConfig";
import type { EAccommodationType } from "@/modules/accommodation/enums/EAccommodationType";
import type { ERentalType } from "@/modules/accommodation/enums/ERentalType";
import type { EAccommodationStatus } from "@/modules/accommodation/enums/EAccommodationStatus";
import type { EFacilityType } from "@/modules/accommodation/enums/EFacilityType";
import type { DynamicPricingSettings } from "@/modules/accommodation/domain/DynamicPricingSettings";

/** An Accommodation row joined to its address and facility configs (with the resolved facility). */
type AccommodationWithDetails = Prisma.AccommodationGetPayload<{
	include: {
		address: true;
		facilities: { include: { facility: true } };
	};
}>;

type AddressEntity = NonNullable<AccommodationWithDetails["address"]>;
type FacilityConfigEntity = AccommodationWithDetails["facilities"][number];

/**
 * Maps the Prisma Accommodation graph (address + facility configs) to the
 * Accommodation domain aggregate. DAO-only; the sole place (besides the DAO) that
 * touches `@/generated/client`. Decimal columns (address lat/long, facility fee)
 * are converted to JS numbers so no Prisma type leaves the DAO.
 */
@injectable()
export class AccommodationEntityMapper {
	public toDomain(entity: AccommodationWithDetails): Accommodation {
		return Accommodation.rehydrate({
			id: entity.id,
			name: entity.name,
			description: entity.description,
			type: entity.type as EAccommodationType,
			rentalType: (entity.rentalType ?? null) as ERentalType | null,
			status: entity.status as EAccommodationStatus,
			ownerId: entity.ownerId,
			dynamicPricingSettings: (entity.dynamicPricingSettings ?? null) as DynamicPricingSettings | null,
			address: entity.address ? this.addressToDomain(entity.address) : null,
			facilities: entity.facilities.map((config) => this.facilityConfigToDomain(config)),
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		});
	}

	private addressToDomain(entity: AddressEntity): Address {
		return Address.rehydrate({
			id: entity.id,
			street: entity.street,
			city: entity.city,
			country: entity.country,
			countryCode: entity.countryCode,
			postalCode: entity.postalCode,
			latitude: entity.latitude === null ? null : Number(entity.latitude),
			longitude: entity.longitude === null ? null : Number(entity.longitude),
			fullAddress: entity.fullAddress,
			placeId: entity.placeId,
		});
	}

	private facilityConfigToDomain(entity: FacilityConfigEntity): FacilityConfig {
		const facility = Facility.rehydrate({
			id: entity.facility.id,
			name: entity.facility.name,
			type: entity.facility.type as EFacilityType,
			description: entity.facility.description,
		});
		return FacilityConfig.rehydrate({
			id: entity.id,
			accommodationId: entity.accommodationId,
			facilityId: entity.facilityId,
			fee: entity.fee === null ? 0 : Number(entity.fee),
			note: entity.note,
			isAvailable: entity.isAvailable,
			facility,
		});
	}
}
