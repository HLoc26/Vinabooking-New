import type { EViewType } from "../../accommodation/constants/viewTypes";
import type {
	ERentalType,
	EAmenityType,
	EFacilityType,
	EAccommodationType,
	EAccommodationStatus,
	FacilityConfig as FacilityConfigFromAccommodation,
} from "../../accommodation/types/accommodation.types";
import type { EPricingType, EBedType, EBedSize } from "../const/RoomConst";

/* ────────────────────────────────────────────────────────
   Owner
──────────────────────────────────────────────────────── */

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

export interface DashboardStats {
	revenue: number;
	occupancyRate: number;
	pendingBookings: number;
}
/* ────────────────────────────────────────────────────────
   API Payloads (Not sorted yet)
──────────────────────────────────────────────────────── */
// Step 2
export type CreateAccommodationPayload = {
	rentalType: ERentalType;
	type: string;
	name: string;
	description: string;
};
export type UpdateAccommodationPayload = {
	name?: string;
	description?: string;
	type?: string;
	rentalType?: ERentalType;
};
export type AccommodationSummary = {
	id: string;
	name: string;
	description?: string;
	type: string;
	rentalType: ERentalType;
	status: "DRAFT" | "PUBLISHED";

	ownerId: string;

	addressId: string | null;
	address: AddressForm | null;

	facilities: {
		facilityId: string;
		name: string;
		fee: number;
		note?: string;
	}[];

	images: {
		id: string;
		url: string;
		target: "accommodation" | "room";
		roomId?: string;
	}[];

	thumbnail: string | null;

	avgStar: number | null;
	reviewCount: number;

	createdAt: string;
	updatedAt: string;
};
// Step 3
export type UpdateAddressPayload = AddressForm;

// Step 4
export type UpdateFacilitiesPayload = {
	facilities: {
		facilityId: string;
		fee: number;
		note: string | null;
	}[];
};

// Step 5
export type CreateRoomPayload = {
	name: string;
	description?: string;
	price?: number;
	pricingType?: string;
	quantity: number;
	maxAdults: number;
	maxChildren: number;
	size?: number;
	bedroomCount: number;
	bathroomCount: number;
	viewType?: string;
	beds: {
		name: string;
		bedType: string;
		size?: string;
	}[];
	amenityIds: string[];
};
/* ────────────────────────────────────────────────────────
   Address (Step 3)
──────────────────────────────────────────────────────── */

export type AddressForm = {
	fullAddress: string;
	street: string;
	city: string;
	country: string;
	latitude: number | null;
	longitude: number | null;
	countryCode: string;
	postalCode: string;
	placeId: string;
};

/* ────────────────────────────────────────────────────────
   Facility (Step 4)
──────────────────────────────────────────────────────── */

export type FacilityConfig = FacilityConfigFromAccommodation;

/* ────────────────────────────────────────────────────────
   Amenity
──────────────────────────────────────────────────────── */

export type AmenityConfigForm = {
	amenityId: string;
	name: string;
	type: EAmenityType;
	note?: string;
};

export type AmenityDto = {
	id: string;
	name: string;
	type: EAmenityType;
	description?: string;
	createdAt: string;
	updatedAt: string;
};

/* ────────────────────────────────────────────────────────
   Facility DTO
──────────────────────────────────────────────────────── */

export type FacilityDto = {
	id: string;
	name: string;
	type: EFacilityType;
	description?: string;
	createdAt: string;
	updatedAt: string;
};

/* ────────────────────────────────────────────────────────
   Beds
──────────────────────────────────────────────────────── */

export type BedForm = {
	id: string;
	name: string;
	description?: string;
	bedType: string;
	size?: string;
	price?: number;
	quantity?: number;
};

/* ────────────────────────────────────────────────────────
   Rooms (Step 5)
──────────────────────────────────────────────────────── */

export type RoomForm = {
	// Frontend ID (always exists)
	tempId: string;

	// Backend ID (after API call)
	id?: string;

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

	// Backend expects amenityIds → keep full objects for UI
	amenities: AmenityConfigForm[];
};
export interface CreateBedBatchDTO {
	id?: string;
	name?: string;
	bedType: EBedType;
	size?: EBedSize;
	/** Only relevant when accommodationType === "SHARED_ROOM" */
	price?: number;
	quantity?: number;
}
export interface UpdateRoomDTO {
	name: string;
	description?: string;
	quantity?: number;
	maxAdults?: number;
	maxChildren?: number;
	size?: number;
	bedroomCount?: number;
	bathroomCount?: number;
	viewType?: EViewType;
	viewDescription?: string;
	price?: number;
	pricingType?: EPricingType;
	isActive?: boolean;

	beds: CreateBedBatchDTO[];
	/** Array of amenity UUIDs */
	amenityIds: string[];
}
export interface BedSummary {
	id: string;
	name: string | null;
	description: string | null;
	bedType: EBedType;
	size: EBedSize | null;
	/** null when accommodation is not SHARED_ROOM */
	price: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	roomId: string;
}

export interface AmenitySummaryEntry {
	id: string;
	name: string;
	type: string;
	isAvailable: true;
}
// ---------- response shape ----------

export interface RoomSummary {
	id: string;
	accommodationId: string;
	name: string;
	description: string | null;
	quantity: number;
	maxAdults: number;
	maxChildren: number;
	size: number | null;
	bedroomCount: number;
	bathroomCount: number;
	viewType: EViewType;
	viewDescription: string | null;
	/** Server returns price as a string (decimal column) */
	price: string | null;
	pricingType: EPricingType;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	beds: BedSummary[];
	amenities: AmenitySummaryEntry[];
}

/* ────────────────────────────────────────────────────────
   Images (Step 6)
──────────────────────────────────────────────────────── */

export type ImageItem = {
	id: string; // nanoid (frontend key)

	file?: File; // before upload
	url?: string; // preview or backend URL

	target: "accommodation" | "room";

	// For linking
	roomId?: string;
	roomTempId?: string;
};

/* ────────────────────────────────────────────────────────
   Wizard Form (FULL FLOW)
──────────────────────────────────────────────────────── */

export type WizardForm = {
	// Step 2
	rentalType: ERentalType | "";
	accommodationType: string;
	name: string;
	description: string;

	// CRITICAL (set after POST /accommodations)
	accommodationId?: string;

	// Step 3
	address: AddressForm;

	// Step 4
	facilities: FacilityConfig[];

	// Step 5
	rooms: RoomForm[];

	// Step 6
	images: ImageItem[];
};
