import { injectable } from "tsyringe";
import type { Room } from "@/modules/room/domain/Room";
import type { Bed } from "@/modules/room/domain/Bed";
import type { AmenityConfig } from "@/modules/room/domain/AmenityConfig";
import { RoomResponse } from "@/modules/room/dto/response/RoomResponse";
import { BedResponse } from "@/modules/room/dto/response/BedResponse";
import { AmenityResponse } from "@/modules/room/dto/response/AmenityResponse";
import type { ImageResponse } from "@/modules/image";
import type { QuoteItemPricingResponse } from "@/modules/pricing";

/** Optional cross-module enrichments attached to a room response. */
export interface RoomResponseEnrichment {
	images?: ImageResponse[];
	pricing?: QuoteItemPricingResponse;
}

/** Maps the Room domain aggregate to its response DTO (with optional images + pricing). */
@injectable()
export class RoomDtoMapper {
	public toResponse(room: Room, enrichment: RoomResponseEnrichment = {}): RoomResponse {
		const response = new RoomResponse();
		response.id = room.id;
		response.accommodationId = room.accommodationId;
		response.name = room.name;
		response.description = room.description;
		response.quantity = room.quantity;
		response.maxAdults = room.maxAdults;
		response.maxChildren = room.maxChildren;
		response.size = room.size;
		response.bedroomCount = room.bedroomCount;
		response.bathroomCount = room.bathroomCount;
		response.viewType = room.viewType;
		response.viewDescription = room.viewDescription;
		response.basePrice = room.basePrice;
		response.floorPrice = room.floorPrice;
		response.pricingType = room.pricingType;
		response.isActive = room.isActive;
		response.beds = room.beds.map((bed) => this.toBedResponse(bed));
		response.amenities = room.amenities.map((config) => this.toAmenityResponse(config));
		response.images = enrichment.images ?? [];
		response.pricing = enrichment.pricing;
		return response;
	}

	private toBedResponse(bed: Bed): BedResponse {
		const response = new BedResponse();
		response.id = bed.id;
		response.name = bed.name;
		response.description = bed.description;
		response.bedType = bed.bedType;
		response.size = bed.size;
		response.quantity = bed.quantity;
		response.price = bed.price;
		response.isActive = bed.isActive;
		return response;
	}

	private toAmenityResponse(config: AmenityConfig): AmenityResponse {
		const response = new AmenityResponse();
		// Mirrors the monolith: surface the underlying amenity id (NOT the join-row id).
		response.id = config.amenity.id;
		response.name = config.amenity.name;
		response.type = config.amenity.type;
		response.description = config.amenity.description;
		return response;
	}
}
