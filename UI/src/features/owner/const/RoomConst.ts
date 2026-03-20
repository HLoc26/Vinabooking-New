import { nanoid } from "@reduxjs/toolkit";
import type { AmenityConfigForm, BedForm, RoomForm } from "../types/owner.types";

export const VIEW_TYPES = ["NONE", "SEA", "OCEAN", "RIVER", "LAKE", "CITY", "GARDEN", "MOUNTAIN", "POOL", "STREET", "COURTYARD", "LANDMARK", "PARTIAL_SEA", "PARTIAL_CITY", "OTHER"];

export const PRICING_TYPES = ["PER_NIGHT", "PER_PERSON_PER_NIGHT", "PER_HOUR", "CUSTOM"];

export const BED_TYPES = ["SINGLE", "TWIN", "DOUBLE", "QUEEN", "KING", "SOFA_BED", "BUNK", "FUTON", "FLOOR_MAT", "WATER_BED", "OTHER"];

export const BED_SIZES = ["Single (90×190cm)", "Twin (90×190cm)", "Double (135×190cm)", "Queen (160×200cm)", "King (180×200cm)", "Super King (200×200cm)"];

export const AMENITY_PRESETS: AmenityConfigForm[] = [
	{ amenityId: "wifi", name: "WiFi", type: "CONNECTIVITY" },
	{ amenityId: "ac", name: "Air Conditioning", type: "CLIMATE" },
	{ amenityId: "tv", name: "Smart TV", type: "ENTERTAINMENT" },
	{ amenityId: "minibar", name: "Minibar", type: "FOOD_DRINK" },
	{ amenityId: "safe", name: "In-room Safe", type: "SECURITY" },
	{ amenityId: "bathtub", name: "Bathtub", type: "BATHROOM" },
	{ amenityId: "shower", name: "Rain Shower", type: "BATHROOM" },
	{ amenityId: "hairdryer", name: "Hair Dryer", type: "BATHROOM" },
	{ amenityId: "desk", name: "Work Desk", type: "WORKSPACE" },
	{ amenityId: "balcony", name: "Balcony", type: "OUTDOOR" },
	{ amenityId: "kettle", name: "Electric Kettle", type: "FOOD_DRINK" },
	{ amenityId: "wardrobe", name: "Wardrobe", type: "STORAGE" },
];
export function makeRoom(): RoomForm {
	return {
		id: nanoid(),
		name: "",
		description: "",
		quantity: 1,
		maxAdults: 2,
		maxChildren: 0,
		size: undefined,
		bedroomCount: 1,
		bathroomCount: 1,
		viewType: "NONE",
		viewDescription: "",
		price: undefined,
		pricingType: "PER_NIGHT",
		beds: [],
		amenities: [],
	};
}
export function makeBed(): BedForm {
	return {
		id: nanoid(),
		name: "",
		bedType: "DOUBLE",
		size: "",
		description: "",
		price: undefined,
	};
}
