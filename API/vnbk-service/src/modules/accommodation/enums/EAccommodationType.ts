/**
 * Accommodation type. Const object + string-union type, mirroring the Prisma
 * generated enum exactly so domain <-> persistence assignment is friction-free,
 * while keeping the domain free of any `@/generated` import.
 */
export const EAccommodationType = {
	HOTEL: "HOTEL",
	APARTMENT: "APARTMENT",
	VILLA: "VILLA",
	VACATION_HOME: "VACATION_HOME",
	GUESTHOUSE: "GUESTHOUSE",
	HOSTEL: "HOSTEL",
	BED_AND_BREAKFAST: "BED_AND_BREAKFAST",
	HOMESTAY: "HOMESTAY",
	CAMPGROUND: "CAMPGROUND",
	COUNTRY_HOUSE: "COUNTRY_HOUSE",
	BOAT: "BOAT",
	LUXURY_TENT: "LUXURY_TENT",
	CABIN: "CABIN",
	MOTEL: "MOTEL",
	RESORT: "RESORT",
	FARMSTAY: "FARMSTAY",
	CAPSULE_HOTEL: "CAPSULE_HOTEL",
	TREEHOUSE: "TREEHOUSE",
	TOWNHOUSE: "TOWNHOUSE",
	OTHER: "OTHER",
} as const;

export type EAccommodationType = (typeof EAccommodationType)[keyof typeof EAccommodationType];
