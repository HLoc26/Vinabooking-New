import { EAccommodationType } from "../types/accommodation.types";

import allImg from "../../../images/ALL.jpg";
import hotelImg from "../../../images/HOTEL.avif";
import apartmentImg from "../../../images/APARTMENT.avif";
import villaImg from "../../../images/VILLA.avif";
import vacationHomeImg from "../../../images/VACATION_HOME.avif";
import guesthouseImg from "../../../images/GUESTHOUSE.avif";
import hostelImg from "../../../images/HOSTEL.avif";
import bedAndBreakfastImg from "../../../images/BED_AND_BREAKFAST.jpg";
import homestayImg from "../../../images/HOMESTAY.avif";
import campgroundImg from "../../../images/CAMPGROUND.avif";
import countryHouseImg from "../../../images/COUNTRY_HOUSE.avif";
import boatImg from "../../../images/BOAT.avif";
import luxuryTentImg from "../../../images/LUXURY_TENT.avif";
import cabinImg from "../../../images/CABIN.avif";
import motelImg from "../../../images/MOTEL.avif";
import resortImg from "../../../images/RESORT.avif";
import farmstayImg from "../../../images/FARMSTAY.avif";
import capsuleHotelImg from "../../../images/CAPSULE_HOTEL.avif";
import treehouseImg from "../../../images/TREEHOUSE.avif";
import townhouseImg from "../../../images/TOWNHOUSE.avif";
import otherImg from "../../../images/OTHER.avif";

export const ACCOMMODATION_DEFAULT_IMAGES: Partial<Record<EAccommodationType, string>> = {
	[EAccommodationType.ALL]: allImg,
	[EAccommodationType.HOTEL]: hotelImg,
	[EAccommodationType.APARTMENT]: apartmentImg,
	[EAccommodationType.VILLA]: villaImg,
	[EAccommodationType.VACATION_HOME]: vacationHomeImg,
	[EAccommodationType.GUESTHOUSE]: guesthouseImg,
	[EAccommodationType.HOSTEL]: hostelImg,
	[EAccommodationType.BED_AND_BREAKFAST]: bedAndBreakfastImg,
	[EAccommodationType.HOMESTAY]: homestayImg,
	[EAccommodationType.CAMPGROUND]: campgroundImg,
	[EAccommodationType.COUNTRY_HOUSE]: countryHouseImg,
	[EAccommodationType.BOAT]: boatImg,
	[EAccommodationType.LUXURY_TENT]: luxuryTentImg,
	[EAccommodationType.CABIN]: cabinImg,
	[EAccommodationType.MOTEL]: motelImg,
	[EAccommodationType.RESORT]: resortImg,
	[EAccommodationType.FARMSTAY]: farmstayImg,
	[EAccommodationType.CAPSULE_HOTEL]: capsuleHotelImg,
	[EAccommodationType.TREEHOUSE]: treehouseImg,
	[EAccommodationType.TOWNHOUSE]: townhouseImg,
	[EAccommodationType.OTHER]: otherImg,
};
