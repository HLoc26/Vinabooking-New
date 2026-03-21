import { EAccommodationType, EAccommodationStatus } from "@/generated/client";

export interface AccommodationCardResponse {
	id: string;
	name: string;
	type: EAccommodationType;
	status: EAccommodationStatus;
	thumbnail: string | null;
	address: string | null;
	roomCount: number;
	reviewCount: number;
	avgStar: number | null;
	updatedAt: Date;
}
