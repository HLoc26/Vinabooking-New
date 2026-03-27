import { useQuery } from "@tanstack/react-query";
import { getOwnerAmenities } from "../services/ownerApi";
import type { AmenityDto } from "../types/owner.types";
import type { EAmenityType } from "../../accommodation/types/accommodation.types";

export const ownerQueryKeys = {
	amenities: ["amenities"] as const,
	facilities: ["facilities"] as const,
} as const;

// ─── useAmenities ─────────────────────────────────────────────────────────────

interface UseAmenitiesOptions {
	filterByType?: EAmenityType;
	enabled?: boolean;
}

export function useOwnerAmenities({ filterByType, enabled = true }: UseAmenitiesOptions = {}) {
	const query = useQuery<AmenityDto[]>({
		queryKey: ownerQueryKeys.amenities,
		queryFn: async () => {
			const response = await getOwnerAmenities();

			const data = response.data;
			if (!data) throw new Error(response.error as string);

			return data;
		},
		staleTime: 5 * 60 * 1000,
		enabled,
	});

	const data = query.data ?? [];

	const filtered: AmenityDto[] = filterByType ? data.filter((a) => a.type === filterByType) : data;

	const groupedByType = data.reduce<Record<EAmenityType, AmenityDto[]>>(
		(acc, amenity) => {
			(acc[amenity.type] ??= []).push(amenity);
			return acc;
		},
		{} as Record<EAmenityType, AmenityDto[]>
	);

	return {
		...query,
		amenities: filtered,
		groupedByType,
		isEmpty: !query.isLoading && filtered.length === 0,
	};
}
