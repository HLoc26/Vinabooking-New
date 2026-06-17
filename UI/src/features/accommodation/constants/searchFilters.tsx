import { Wifi, Pool, LocalParking, Restaurant, FitnessCenter, Spa } from "@mui/icons-material";
import { EAccommodationType, type SortOption, ECancellationPolicy, EPrepaymentPolicy } from "../types/accommodation.types";
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

export const CANCELLATION_EN_LABELS: Record<string, string> = {
	"ANY": "Any time",
	[ECancellationPolicy.CANCEL_NONE]: "Non-refundable",
	[ECancellationPolicy.CANCEL_24H]: "Free cancellation up to 24h",
	[ECancellationPolicy.CANCEL_48H]: "Free cancellation up to 48h",
	[ECancellationPolicy.CANCEL_7D]: "Free cancellation up to 7 days",
	[ECancellationPolicy.CANCEL_14D]: "Free cancellation up to 14 days",
};

export const PREPAYMENT_EN_LABELS: Record<string, string> = {
	"ANY": "Any time",
	[EPrepaymentPolicy.PREPAY_NONE]: "Pay at property",
	[EPrepaymentPolicy.PREPAY_50]: "50% Deposit",
	[EPrepaymentPolicy.PREPAY_100]: "100% Prepayment",
};

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
	MAX: 5000000,
	STEP: 100000,
};

export const SORT_OPTIONS: SortOptionItem[] = [
	{ value: "recommended", label: "Recommended" },
	{ value: "newest", label: "Newest" },
	{ value: "price_asc", label: "Price: Low to High" },
	{ value: "price_desc", label: "Price: High to Low" },
	{ value: "rating", label: "Highest Rated" },
];
