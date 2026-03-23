import type { EAccommodationType, EAccommodationStatus } from "../../accommodation/types/accommodation.types";

export interface OwnerProfileData {
	id: string;
	userId: string;
	businessName: string | null;
	taxId: string | null;
	contactPhone: string;
	isVerified: boolean;
}

export interface UpgradeOwnerPayload {
	businessName?: string;
	taxId?: string;
	contactPhone: string;
}

export interface OwnerAccommodationCard {
	id: string;
	name: string;
	type: EAccommodationType;
	status: EAccommodationStatus;
	thumbnail: string | null;
	address: string | null;
	roomCount: number;
	reviewCount: number;
	avgStar: number | null;
	updatedAt: string;
}
