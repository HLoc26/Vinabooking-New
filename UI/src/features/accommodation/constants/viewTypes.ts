export type EViewType = "SEA" | "OCEAN" | "RIVER" | "LAKE" | "CITY" | "GARDEN" | "MOUNTAIN" | "POOL" | "STREET" | "COURTYARD" | "LANDMARK" | "PARTIAL_SEA" | "PARTIAL_CITY" | "NONE" | "OTHER";

export const VIEW_TYPE_LABELS: Record<EViewType, string> = {
	SEA: "Sea",
	OCEAN: "Ocean",
	RIVER: "River",
	LAKE: "Lake",
	CITY: "City",
	GARDEN: "Garden",
	MOUNTAIN: "Mountain",
	POOL: "Pool",
	STREET: "Street",
	COURTYARD: "Courtyard",
	LANDMARK: "Landmark",
	PARTIAL_SEA: "Partial Sea",
	PARTIAL_CITY: "Partial City",
	NONE: "No View",
	OTHER: "Other",
};

export const getViewTypeLabel = (viewType: string | null | undefined): string => {
	if (!viewType) return "";
	return VIEW_TYPE_LABELS[viewType as EViewType] || viewType;
};
