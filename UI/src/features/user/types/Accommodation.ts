export interface Accommodation {
	id: string;
	name: string;
	description: string;
	type: string; // or enum AccommodationType
	rentalType: string; // or enum RentalType
	isActive: boolean;
	ownerId: string;
	createdAt: string;
	updatedAt: string;
	addressId: string;
	address: AccommodationAddress;
	facilities: AccommodationFacility[];
	rooms: AccommodationRoom[];
	images: AccommodationImage[];
}

export interface AccommodationAddress {
	id: string;
	street: string;
	ward: string;
	district: string;
	city: string;
	country: string;
	countryCode: string;
	postalCode: string;
	latitude: string;
	longitude: string;
	fullAddress: string;
	placeId: string;
	createdAt: string;
	updatedAt: string;
}

export interface AccommodationFacility {
	id: string;
	fee: string;
	note: string;
	isAvailable: boolean;
	createdAt: string;
	updatedAt: string;
	accommodationId: string;
	facilityId: string;
	facility: Facility;
}

export interface Facility {
	id: string;
	name: string;
	type: string; // enum FacilityType
	description: string;
	createdAt: string;
	updatedAt: string;
}

export interface AccommodationRoom {
	id: string;
	accommodationId: string;
	name: string;
	description: string;
	quantity: number;
	maxAdults: number;
	maxChildren: number;
	size: string;
	bedroomCount: number;
	bathroomCount: number;
	viewType: string; // enum RoomViewType
	viewDescription: string;
	price: string;
	pricingType: string; // enum PricingType
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	beds: RoomBed[];
	amenities: RoomAmenity[];
	remainingQuantity: number;
}

export interface RoomBed {
	id: string;
}

export interface RoomAmenity {
	id: string;
	note: string;
	createdAt: string;
	updatedAt: string;
	roomId: string;
	amenityId: string;
	amenity: Amenity;
}

export interface Amenity {
	id: string;
	name: string;
	type: string; // enum AmenityType
	description: string;
	createdAt: string;
	updatedAt: string;
}

export interface AccommodationImage {
	id: string;
	variant: "THUMBNAIL" | "ORIGINAL" | "WEBP" | "OPTIMIZED";
	url: string;
	imageId: string;
}
