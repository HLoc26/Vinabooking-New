import type { AccommodationTypeData } from "../services/types/AccommodationTypeData";
import { EAccommodationType } from "../../../types/acommodation";
import { ACCOMMODATION_LABELS, ACCOMMODATION_HERO_IMAGES } from "../../accommodation-type/constants/Const";

export const ACCOMMODATION_TYPES: AccommodationTypeData[] = [
	{
		id: EAccommodationType.HOTEL,
		name: ACCOMMODATION_LABELS[EAccommodationType.HOTEL]!,
		imageUrl: ACCOMMODATION_HERO_IMAGES[EAccommodationType.HOTEL]!,
	},
	{
		id: EAccommodationType.APARTMENT,
		name: ACCOMMODATION_LABELS[EAccommodationType.APARTMENT]!,
		imageUrl: ACCOMMODATION_HERO_IMAGES[EAccommodationType.APARTMENT]!,
	},
	{
		id: EAccommodationType.VILLA,
		name: ACCOMMODATION_LABELS[EAccommodationType.VILLA]!,
		imageUrl: ACCOMMODATION_HERO_IMAGES[EAccommodationType.VILLA]!,
	},
	{
		id: EAccommodationType.RESORT,
		name: ACCOMMODATION_LABELS[EAccommodationType.RESORT]!,
		imageUrl: ACCOMMODATION_HERO_IMAGES[EAccommodationType.RESORT]!,
	},
	{
		id: EAccommodationType.VACATION_HOME,
		name: ACCOMMODATION_LABELS[EAccommodationType.VACATION_HOME]!,
		imageUrl: ACCOMMODATION_HERO_IMAGES[EAccommodationType.VACATION_HOME]!,
	},
	{
		id: EAccommodationType.GUESTHOUSE,
		name: ACCOMMODATION_LABELS[EAccommodationType.GUESTHOUSE]!,
		imageUrl: ACCOMMODATION_HERO_IMAGES[EAccommodationType.GUESTHOUSE]!,
	},
	{
		id: EAccommodationType.HOSTEL,
		name: ACCOMMODATION_LABELS[EAccommodationType.HOSTEL]!,
		imageUrl: ACCOMMODATION_HERO_IMAGES[EAccommodationType.HOSTEL]!,
	},
	{
		id: EAccommodationType.BED_AND_BREAKFAST,
		name: ACCOMMODATION_LABELS[EAccommodationType.BED_AND_BREAKFAST]!,
		imageUrl: ACCOMMODATION_HERO_IMAGES[EAccommodationType.BED_AND_BREAKFAST]!,
	},
	{
		id: EAccommodationType.HOMESTAY,
		name: ACCOMMODATION_LABELS[EAccommodationType.HOMESTAY]!,
		imageUrl: ACCOMMODATION_HERO_IMAGES[EAccommodationType.HOMESTAY]!,
	},
	{
		id: EAccommodationType.CABIN,
		name: ACCOMMODATION_LABELS[EAccommodationType.CABIN]!,
		imageUrl: ACCOMMODATION_HERO_IMAGES[EAccommodationType.CABIN]!,
	},
	{
		id: EAccommodationType.TREEHOUSE,
		name: ACCOMMODATION_LABELS[EAccommodationType.TREEHOUSE]!,
		imageUrl: ACCOMMODATION_HERO_IMAGES[EAccommodationType.TREEHOUSE]!,
	},
	{
		id: EAccommodationType.LUXURY_TENT,
		name: ACCOMMODATION_LABELS[EAccommodationType.LUXURY_TENT]!,
		imageUrl: ACCOMMODATION_HERO_IMAGES[EAccommodationType.LUXURY_TENT]!,
	},
	{
		id: EAccommodationType.CAMPGROUND,
		name: ACCOMMODATION_LABELS[EAccommodationType.CAMPGROUND]!,
		imageUrl: ACCOMMODATION_HERO_IMAGES[EAccommodationType.CAMPGROUND]!,
	},
	{
		id: EAccommodationType.FARMSTAY,
		name: ACCOMMODATION_LABELS[EAccommodationType.FARMSTAY]!,
		imageUrl: ACCOMMODATION_HERO_IMAGES[EAccommodationType.FARMSTAY]!,
	},
	{
		id: EAccommodationType.BOAT,
		name: ACCOMMODATION_LABELS[EAccommodationType.BOAT]!,
		imageUrl: ACCOMMODATION_HERO_IMAGES[EAccommodationType.BOAT]!,
	},
	{
		id: EAccommodationType.OTHER,
		name: ACCOMMODATION_LABELS[EAccommodationType.OTHER]!,
		imageUrl: ACCOMMODATION_HERO_IMAGES[EAccommodationType.OTHER]!,
	},
];
