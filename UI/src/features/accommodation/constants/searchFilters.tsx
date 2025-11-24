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
	{ value: "RESORT", label: "Resort" },
	{ value: "VILLA", label: "Villa" },
	{ value: "HOMESTAY", label: "Homestay" },
	{ value: "HOSTEL", label: "Hostel" },
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
