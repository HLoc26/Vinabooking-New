import { Wifi, Pool, LocalParking, Restaurant, FitnessCenter, Spa } from "@mui/icons-material";
import type { SortOption } from "../types/accommodation.types";
import type { ReactElement } from "react";

export interface AccommodationTypeOption {
	value: string;
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
	{ value: "HOTEL", label: "Hotel" },
	{ value: "APARTMENT", label: "Apartment" },
	{ value: "VILLA", label: "Villa" },
	{ value: "VACATION_HOME", label: "Vacation Home" },
	{ value: "GUESTHOUSE", label: "Guesthouse" },
	{ value: "HOSTEL", label: "Hostel" },
	{ value: "BED_AND_BREAKFAST", label: "Bed & Breakfast" },
	{ value: "HOMESTAY", label: "Homestay" },
	{ value: "CAMPGROUND", label: "Campground" },
	{ value: "COUNTRY_HOUSE", label: "Country House" },
	{ value: "BOAT", label: "Boat" },
	{ value: "LUXURY_TENT", label: "Luxury Tent" },
	{ value: "CABIN", label: "Cabin" },
	{ value: "MOTEL", label: "Motel" },
	{ value: "RESORT", label: "Resort" },
	{ value: "FARMSTAY", label: "Farmstay" },
	{ value: "CAPSULE_HOTEL", label: "Capsule Hotel" },
	{ value: "TREEHOUSE", label: "Treehouse" },
	{ value: "TOWNHOUSE", label: "Townhouse" },
	{ value: "OTHER", label: "Other" },
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
	MAX: 500,
	STEP: 10,
};

export const SORT_OPTIONS: SortOptionItem[] = [
	{ value: "recommended", label: "Recommended" },
	{ value: "newest", label: "Newest" },
	{ value: "price_asc", label: "Price: Low to High" },
	{ value: "price_desc", label: "Price: High to Low" },
	{ value: "rating", label: "Highest Rated" },
];
