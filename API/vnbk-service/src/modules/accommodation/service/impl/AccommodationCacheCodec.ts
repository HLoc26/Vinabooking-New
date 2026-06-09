import { injectable } from "tsyringe";
import { Accommodation } from "@/modules/accommodation/domain/Accommodation";
import { Address } from "@/modules/accommodation/domain/Address";
import { Facility } from "@/modules/accommodation/domain/Facility";
import { FacilityConfig } from "@/modules/accommodation/domain/FacilityConfig";

/**
 * (De)serializes the base Accommodation aggregate (base fields + address +
 * facility configs) for the `acc:detail:` Redis cache. Only the cacheable base
 * graph is stored — images, rooms, and stats are merged in fresh on each read
 * (mirrors the monolith, which caches `AccommodationWithDetails`).
 */
@injectable()
export class AccommodationCacheCodec {
	public encode(accommodation: Accommodation): string {
		return JSON.stringify(this.toPlain(accommodation));
	}

	public decode(raw: string): Accommodation | null {
		const plain = JSON.parse(raw) as PlainAccommodation;
		if (!plain || !plain.id) return null;
		return this.fromPlain(plain);
	}

	private toPlain(acc: Accommodation): PlainAccommodation {
		return {
			id: acc.id,
			name: acc.name,
			description: acc.description,
			type: acc.type,
			rentalType: acc.rentalType,
			status: acc.status,
			ownerId: acc.ownerId,
			dynamicPricingSettings: acc.dynamicPricingSettings,
			createdAt: acc.createdAt ? acc.createdAt.toISOString() : null,
			updatedAt: acc.updatedAt ? acc.updatedAt.toISOString() : null,
			address: acc.address
				? {
						id: acc.address.id,
						street: acc.address.street,
						city: acc.address.city,
						country: acc.address.country,
						countryCode: acc.address.countryCode,
						postalCode: acc.address.postalCode,
						latitude: acc.address.latitude,
						longitude: acc.address.longitude,
						fullAddress: acc.address.fullAddress,
						placeId: acc.address.placeId,
					}
				: null,
			facilities: acc.facilities.map((f) => ({
				id: f.id,
				accommodationId: f.accommodationId,
				facilityId: f.facilityId,
				fee: f.fee,
				note: f.note,
				isAvailable: f.isAvailable,
				facility: {
					id: f.facility.id,
					name: f.facility.name,
					type: f.facility.type,
					description: f.facility.description,
				},
			})),
		};
	}

	private fromPlain(plain: PlainAccommodation): Accommodation {
		return Accommodation.rehydrate({
			id: plain.id,
			name: plain.name,
			description: plain.description,
			type: plain.type,
			rentalType: plain.rentalType,
			status: plain.status,
			ownerId: plain.ownerId,
			dynamicPricingSettings: plain.dynamicPricingSettings,
			createdAt: plain.createdAt ? new Date(plain.createdAt) : undefined,
			updatedAt: plain.updatedAt ? new Date(plain.updatedAt) : undefined,
			address: plain.address ? Address.rehydrate(plain.address) : null,
			facilities: plain.facilities.map((f) =>
				FacilityConfig.rehydrate({
					id: f.id,
					accommodationId: f.accommodationId,
					facilityId: f.facilityId,
					fee: f.fee,
					note: f.note,
					isAvailable: f.isAvailable,
					facility: Facility.rehydrate(f.facility),
				})
			),
		});
	}
}

/** The plain JSON shape stored in the cache (dates as ISO strings). */
interface PlainAccommodation {
	id: string;
	name: string;
	description: string | null;
	type: Accommodation["type"];
	rentalType: Accommodation["rentalType"];
	status: Accommodation["status"];
	ownerId: string;
	dynamicPricingSettings: Accommodation["dynamicPricingSettings"];
	createdAt: string | null;
	updatedAt: string | null;
	address: {
		id: string;
		street: string;
		city: string;
		country: string;
		countryCode: string;
		postalCode: string | null;
		latitude: number | null;
		longitude: number | null;
		fullAddress: string;
		placeId: string | null;
	} | null;
	facilities: {
		id: string;
		accommodationId: string;
		facilityId: string;
		fee: number;
		note: string | null;
		isAvailable: boolean;
		facility: {
			id: string;
			name: string;
			type: FacilityType;
			description: string | null;
		};
	}[];
}

/** The facility type as carried in the cached payload. */
type FacilityType = Facility["type"];
