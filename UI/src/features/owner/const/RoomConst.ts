import { nanoid } from "@reduxjs/toolkit";
import type { BedForm, RoomForm } from "../types/owner.types";

export const VIEW_TYPES = ["NONE", "SEA", "OCEAN", "RIVER", "LAKE", "CITY", "GARDEN", "MOUNTAIN", "POOL", "STREET", "COURTYARD", "LANDMARK", "PARTIAL_SEA", "PARTIAL_CITY", "OTHER"];

export const PRICING_TYPES = ["PER_NIGHT", "PER_PERSON_PER_NIGHT", "PER_HOUR", "CUSTOM"];

export const BED_TYPES = ["SINGLE", "TWIN", "DOUBLE", "QUEEN", "KING", "SOFA_BED", "BUNK", "FUTON", "FLOOR_MAT", "WATER_BED", "OTHER"];

export const BED_SIZES = ["Single (90×190cm)", "Twin (90×190cm)", "Double (135×190cm)", "Queen (160×200cm)", "King (180×200cm)", "Super King (200×200cm)"];

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
// ─── const objects (erasableSyntaxOnly-safe, no enum keyword) ────────────────

export const EViewType = {
	NONE: "NONE",
	SEA: "SEA",
	OCEAN: "OCEAN",
	RIVER: "RIVER",
	LAKE: "LAKE",
	CITY: "CITY",
	GARDEN: "GARDEN",
	MOUNTAIN: "MOUNTAIN",
	POOL: "POOL",
	STREET: "STREET",
	COURTYARD: "COURTYARD",
	LANDMARK: "LANDMARK",
	PARTIAL_SEA: "PARTIAL_SEA",
	PARTIAL_CITY: "PARTIAL_CITY",
	OTHER: "OTHER",
} as const;
export type EViewType = (typeof EViewType)[keyof typeof EViewType];

export const EPricingType = {
	PER_NIGHT: "PER_NIGHT",
	PER_PERSON_PER_NIGHT: "PER_PERSON_PER_NIGHT",
	PER_HOUR: "PER_HOUR",
	CUSTOM: "CUSTOM",
} as const;
export type EPricingType = (typeof EPricingType)[keyof typeof EPricingType];

export const EBedType = {
	SINGLE: "SINGLE",
	TWIN: "TWIN",
	DOUBLE: "DOUBLE",
	QUEEN: "QUEEN",
	KING: "KING",
	SOFA_BED: "SOFA_BED",
	BUNK: "BUNK",
	FUTON: "FUTON",
	FLOOR_MAT: "FLOOR_MAT",
	WATER_BED: "WATER_BED",
	OTHER: "OTHER",
} as const;
export type EBedType = (typeof EBedType)[keyof typeof EBedType];

// Values are the display labels stored in BedForm.size
export const EBedSize = {
	SINGLE: "Single (90×190cm)",
	TWIN: "Twin (90×190cm)",
	DOUBLE: "Double (135×190cm)",
	QUEEN: "Queen (160×200cm)",
	KING: "King (180×200cm)",
	SUPER_KING: "Super King (200×200cm)",
} as const;
export type EBedSize = (typeof EBedSize)[keyof typeof EBedSize];

// ─── Mappers ──────────────────────────────────────────────────────────────────

export function toEViewType(raw: string | undefined): EViewType {
	const values = Object.values(EViewType) as string[];
	if (raw && values.includes(raw)) return raw as EViewType;
	return EViewType.NONE;
}

export function toEPricingType(raw: string | undefined): EPricingType {
	const values = Object.values(EPricingType) as string[];
	if (raw && values.includes(raw)) return raw as EPricingType;
	return EPricingType.PER_NIGHT;
}

export function toEBedType(raw: string | undefined): EBedType {
	const values = Object.values(EBedType) as string[];
	if (raw && values.includes(raw)) return raw as EBedType;
	return EBedType.DOUBLE;
}

export function toEBedSize(raw: string | undefined): EBedSize | undefined {
	const values = Object.values(EBedSize) as string[];
	if (raw && values.includes(raw)) return raw as EBedSize;
	return undefined;
}
