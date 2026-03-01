import { Wifi, Pool, LocalParking, Restaurant, FitnessCenter, Spa } from "@mui/icons-material";
import { EAccommodationType, type SortOption } from "../types/accommodation.types";
import type { ReactElement } from "react";

export interface AccommodationTypeOption {
	value: EAccommodationType;
	label: string;
}

export interface FacilityFilterOption {
	value: string;
	label: string;
	icon: ReactElement;
}

export interface SortOptionItem {
	value: SortOption;
	label: string;
}

export const ACCOMMODATION_TYPE_OPTIONS: AccommodationTypeOption[] = [
	{
		value: EAccommodationType.ALL,
		label: "All Types",
	},
	{
		value: EAccommodationType.HOTEL,
		label: "Hotel",
	},
	{
		value: EAccommodationType.APARTMENT,
		label: "Apartment",
	},
	{
		value: EAccommodationType.VILLA,
		label: "Villa",
	},
	{
		value: EAccommodationType.VACATION_HOME,
		label: "Vacation Home",
	},
	{
		value: EAccommodationType.GUESTHOUSE,
		label: "Guesthouse",
	},
	{
		value: EAccommodationType.HOSTEL,
		label: "Hostel",
	},
	{
		value: EAccommodationType.BED_AND_BREAKFAST,
		label: "Bed & Breakfast",
	},
	{
		value: EAccommodationType.HOMESTAY,
		label: "Homestay",
	},
	{
		value: EAccommodationType.CAMPGROUND,
		label: "Campground",
	},
	{
		value: EAccommodationType.COUNTRY_HOUSE,
		label: "Country House",
	},
	{
		value: EAccommodationType.BOAT,
		label: "Boat",
	},
	{
		value: EAccommodationType.LUXURY_TENT,
		label: "Luxury Tent",
	},
	{
		value: EAccommodationType.CABIN,
		label: "Cabin",
	},
	{
		value: EAccommodationType.MOTEL,
		label: "Motel",
	},
	{
		value: EAccommodationType.RESORT,
		label: "Resort",
	},
	{
		value: EAccommodationType.FARMSTAY,
		label: "Farmstay",
	},
	{
		value: EAccommodationType.CAPSULE_HOTEL,
		label: "Capsule Hotel",
	},
	{
		value: EAccommodationType.TREEHOUSE,
		label: "Treehouse",
	},
	{
		value: EAccommodationType.TOWNHOUSE,
		label: "Townhouse",
	},
	{
		value: EAccommodationType.OTHER,
		label: "Other",
	},
];

export const FACILITY_FILTER_OPTIONS: FacilityFilterOption[] = [
	{ value: "Wifi", label: "WiFi", icon: <Wifi fontSize="small" /> },
	{ value: "Pool", label: "Swimming Pool", icon: <Pool fontSize="small" /> },
	{ value: "Parking", label: "Parking", icon: <LocalParking fontSize="small" /> },
	{ value: "Restaurant", label: "Restaurant", icon: <Restaurant fontSize="small" /> },
	{ value: "Gym", label: "Fitness Center", icon: <FitnessCenter fontSize="small" /> },
	{ value: "Spa", label: "Spa", icon: <Spa fontSize="small" /> },
];

export const PRICE_FILTER_CONFIG = {
	MIN: 0,
	MAX: 2000,
	STEP: 10,
};

export const SORT_OPTIONS: SortOptionItem[] = [
	{ value: "recommended", label: "Recommended" },
	{ value: "newest", label: "Newest" },
	{ value: "price_asc", label: "Price: Low to High" },
	{ value: "price_desc", label: "Price: High to Low" },
	{ value: "rating", label: "Highest Rated" },
];
