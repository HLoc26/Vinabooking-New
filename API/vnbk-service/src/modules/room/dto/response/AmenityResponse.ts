import { EAmenityType } from "@/modules/room/enums/EAmenityType";

/**
 * Wire representation of a room amenity. `id` is the underlying amenity id (NOT
 * the join-row id), matching the monolith's flattened amenity shape.
 */
export class AmenityResponse {
	id!: string;
	name!: string;
	type!: EAmenityType;
	description!: string | null;
}
