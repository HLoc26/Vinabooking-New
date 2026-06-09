import { EAccommodationType } from "@/modules/accommodation/enums/EAccommodationType";
import { ERentalType } from "@/modules/accommodation/enums/ERentalType";
import { EAccommodationStatus } from "@/modules/accommodation/enums/EAccommodationStatus";
import { AddressResponse } from "@/modules/accommodation/dto/response/AddressResponse";
import { FacilityConfigResponse } from "@/modules/accommodation/dto/response/FacilityConfigResponse";
import type { RoomResponse } from "@/modules/room";
import type { ImageResponse } from "@/modules/image";

/**
 * The full, cross-module representation of an accommodation — the public shape
 * returned by `getById` / `getAccommodationByRoomId` and embedded in search
 * results. Aggregates the base accommodation with its address + facilities, the
 * rooms (from the room module), attached images (from the image module), and
 * computed stats (minPrice / avgStar / reviewCount from the DAO's raw SQL).
 *
 * NOTE: `rooms` are populated only on the single-detail reads (search/batch omit
 * them for payload size, matching the monolith). Live availability is NOT here —
 * it is computed by the booking module to keep the module graph acyclic.
 */
export class AccommodationResponse {
	id!: string;
	name!: string;
	description!: string | null;
	type!: EAccommodationType;
	rentalType!: ERentalType | null;
	status!: EAccommodationStatus;
	ownerId!: string;
	createdAt?: Date;
	updatedAt?: Date;

	address!: AddressResponse | null;
	facilities!: FacilityConfigResponse[];

	// Cross-module enrichments.
	rooms?: RoomResponse[];
	images!: ImageResponse[];
	thumbnail!: string | null;

	// Computed stats (DAO raw SQL: minPrice/avgStar over rooms+beds+reviews).
	minPrice?: number;
	avgStar!: number | null;
	reviewCount!: number;
}
