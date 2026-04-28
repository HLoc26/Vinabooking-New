import { EAccommodationType, ERentalType } from "../types/accommodation.types";

export const ACCOMMODATION_DEFAULT_IMAGES: Partial<Record<EAccommodationType, string>> = {
	[EAccommodationType.ALL]: "/images/ALL.jpg",
	[EAccommodationType.HOTEL]: "/images/HOTEL.avif",
	[EAccommodationType.APARTMENT]: "/images/APARTMENT.avif",
	[EAccommodationType.VILLA]: "/images/VILLA.avif",
	[EAccommodationType.VACATION_HOME]: "/images/VACATION_HOME.avif",
	[EAccommodationType.GUESTHOUSE]: "/images/GUESTHOUSE.avif",
	[EAccommodationType.HOSTEL]: "/images/HOSTEL.avif",
	[EAccommodationType.BED_AND_BREAKFAST]: "/images/BED_AND_BREAKFAST.jpg",
	[EAccommodationType.HOMESTAY]: "/images/HOMESTAY.avif",
	[EAccommodationType.CAMPGROUND]: "/images/CAMPGROUND.avif",
	[EAccommodationType.COUNTRY_HOUSE]: "/images/COUNTRY_HOUSE.avif",
	[EAccommodationType.BOAT]: "/images/BOAT.avif",
	[EAccommodationType.LUXURY_TENT]: "/images/LUXURY_TENT.avif",
	[EAccommodationType.CABIN]: "/images/CABIN.avif",
	[EAccommodationType.MOTEL]: "/images/MOTEL.avif",
	[EAccommodationType.RESORT]: "/images/RESORT.avif",
	[EAccommodationType.FARMSTAY]: "/images/FARMSTAY.avif",
	[EAccommodationType.CAPSULE_HOTEL]: "/images/CAPSULE_HOTEL.avif",
	[EAccommodationType.TREEHOUSE]: "/images/TREEHOUSE.avif",
	[EAccommodationType.TOWNHOUSE]: "/images/TOWNHOUSE.avif",
	[EAccommodationType.OTHER]: "/images/OTHER.avif",
};
export const AccommodationToRentalMap: Partial<Record<EAccommodationType, ERentalType>> = {
	// Entire Place
	[EAccommodationType.APARTMENT]: ERentalType.ENTIRE_PLACE,
	[EAccommodationType.VILLA]: ERentalType.ENTIRE_PLACE,
	[EAccommodationType.VACATION_HOME]: ERentalType.ENTIRE_PLACE,
	[EAccommodationType.TOWNHOUSE]: ERentalType.ENTIRE_PLACE,
	[EAccommodationType.COUNTRY_HOUSE]: ERentalType.ENTIRE_PLACE,
	[EAccommodationType.CABIN]: ERentalType.ENTIRE_PLACE,
	[EAccommodationType.BOAT]: ERentalType.ENTIRE_PLACE,
	[EAccommodationType.TREEHOUSE]: ERentalType.ENTIRE_PLACE,

	// Private Room
	[EAccommodationType.HOTEL]: ERentalType.PRIVATE_ROOM,
	[EAccommodationType.RESORT]: ERentalType.PRIVATE_ROOM,
	[EAccommodationType.MOTEL]: ERentalType.PRIVATE_ROOM,
	[EAccommodationType.GUESTHOUSE]: ERentalType.PRIVATE_ROOM,
	[EAccommodationType.BED_AND_BREAKFAST]: ERentalType.PRIVATE_ROOM,
	[EAccommodationType.HOMESTAY]: ERentalType.PRIVATE_ROOM,
	[EAccommodationType.FARMSTAY]: ERentalType.PRIVATE_ROOM,
	[EAccommodationType.LUXURY_TENT]: ERentalType.PRIVATE_ROOM,
	[EAccommodationType.CAPSULE_HOTEL]: ERentalType.PRIVATE_ROOM,

	// Shared/Public
	[EAccommodationType.HOSTEL]: ERentalType.SHARED_ROOM,
	[EAccommodationType.CAMPGROUND]: ERentalType.SHARED_ROOM,
	[EAccommodationType.OTHER]: ERentalType.SHARED_ROOM,
};
