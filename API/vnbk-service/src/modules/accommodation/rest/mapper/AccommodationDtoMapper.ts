import { injectable } from "tsyringe";
import type { Accommodation } from "@/modules/accommodation/domain/Accommodation";
import type { Address } from "@/modules/accommodation/domain/Address";
import type { FacilityConfig } from "@/modules/accommodation/domain/FacilityConfig";
import { AccommodationResponse } from "@/modules/accommodation/dto/response/AccommodationResponse";
import { AddressResponse } from "@/modules/accommodation/dto/response/AddressResponse";
import { FacilityConfigResponse } from "@/modules/accommodation/dto/response/FacilityConfigResponse";
import type { AccommodationStatsRow } from "@/modules/accommodation/repository/IAccommodationRepository";
import type { RoomResponse } from "@/modules/room";
import type { ImageResponse } from "@/modules/image";

/** Cross-module enrichments merged into an accommodation response. */
export interface AccommodationEnrichment {
	images?: ImageResponse[];
	rooms?: RoomResponse[];
	stats?: AccommodationStatsRow;
}

/**
 * Maps the Accommodation domain aggregate to its response DTO, merging the
 * computed stats (minPrice/avgStar/reviewCount), attached images (thumbnail =
 * first image's url), and rooms. Only `isAvailable` facilities are surfaced and
 * flattened to the catalog facility's name/type/description (mirrors the monolith).
 */
@injectable()
export class AccommodationDtoMapper {
	public toResponse(accommodation: Accommodation, enrichment: AccommodationEnrichment = {}): AccommodationResponse {
		const response = new AccommodationResponse();
		response.id = accommodation.id;
		response.name = accommodation.name;
		response.description = accommodation.description;
		response.type = accommodation.type;
		response.rentalType = accommodation.rentalType;
		response.status = accommodation.status;
		response.ownerId = accommodation.ownerId;
		response.createdAt = accommodation.createdAt;
		response.updatedAt = accommodation.updatedAt;

		response.address = accommodation.address ? this.toAddressResponse(accommodation.address) : null;
		response.facilities = accommodation.facilities
			.filter((f) => f.isAvailable)
			.map((f) => this.toFacilityResponse(f));

		const images = enrichment.images ?? [];
		response.images = images;
		response.thumbnail = images.length > 0 ? images[0].url : null;
		if (enrichment.rooms !== undefined) response.rooms = enrichment.rooms;

		const stats = enrichment.stats;
		response.minPrice = stats?.minPrice ?? undefined;
		response.avgStar = stats?.avgStar ?? null;
		response.reviewCount = stats?.reviewCount ?? 0;

		return response;
	}

	private toAddressResponse(address: Address): AddressResponse {
		const response = new AddressResponse();
		response.id = address.id;
		response.street = address.street;
		response.city = address.city;
		response.country = address.country;
		response.countryCode = address.countryCode;
		response.postalCode = address.postalCode;
		response.latitude = address.latitude;
		response.longitude = address.longitude;
		response.fullAddress = address.fullAddress;
		response.placeId = address.placeId;
		return response;
	}

	private toFacilityResponse(config: FacilityConfig): FacilityConfigResponse {
		const response = new FacilityConfigResponse();
		// Mirrors the monolith: surface the join-row id plus the catalog facility's fields.
		response.id = config.id;
		response.name = config.facility.name;
		response.type = config.facility.type;
		response.description = config.facility.description;
		response.fee = config.fee;
		response.note = config.note;
		return response;
	}
}
