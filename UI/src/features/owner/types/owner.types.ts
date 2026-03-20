import type { ERentalType } from "../../accommodation/types/accommodation.types";
import type { FacilityConfig } from "../const/FacilityConst";

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
export type RoomForm = {
	id: string;
	name: string;
	description?: string;
	quantity: number;
	maxAdults: number;
	maxChildren: number;
	size?: number;
	bedroomCount: number;
	bathroomCount: number;
	viewType: string;
	viewDescription?: string;
	price?: number;
	pricingType: string;
	beds: BedForm[];
	amenities: AmenityConfigForm[];
};

export type BedForm = {
	id: string;
	name: string;
	description?: string;
	bedType: string;
	size?: string;
	price?: number;
};

export type AmenityConfigForm = {
	amenityId: string;
	name: string;
	type: string;
	note?: string;
};

export type AddressForm = {
	fullAddress: string;
	street: string;
	ward: string;
	district: string;
	city: string;
	country: string;
	latitude: number | null;
	longitude: number | null;
};

export type WizardForm = {
	rentalType: ERentalType | "";
	accommodationType: string;
	address: AddressForm;
	facilities: FacilityConfig[];
	rooms: RoomForm[];
};
