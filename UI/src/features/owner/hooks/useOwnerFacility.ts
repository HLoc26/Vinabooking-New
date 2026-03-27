import { useQuery } from "@tanstack/react-query";
import { getOwnerFacilities } from "../services/ownerApi";
import type { FacilityDto } from "../types/owner.types";
import type { EFacilityType } from "../../accommodation/types/accommodation.types";

export const ownerQueryKeys = {
	amenities: ["amenities"] as const,
	facilities: ["facilities"] as const,
} as const;

// ─── useFacilities ────────────────────────────────────────────────────────────

interface UseFacilitiesOptions {
	/** Filter to a specific EFacilityType on the client side */
	enabled?: boolean;
}

export function useOwnerFacilities({ enabled = true }: UseFacilitiesOptions = {}) {
	const query = useQuery<FacilityDto[]>({
		queryKey: ownerQueryKeys.facilities,
		queryFn: async () => {
			const response = await getOwnerFacilities();
			const data = response.data;
			if (!data) throw new Error(response.error as string);

			return data;
		},
		staleTime: 5 * 60 * 1000,
		enabled,
	});

	const groupedByType = (query.data ?? []).reduce<Record<EFacilityType, FacilityDto[]>>(
		(acc, facility) => {
			(acc[facility.type] ??= []).push(facility);
			return acc;
		},
		{} as Record<EFacilityType, FacilityDto[]>
	);

	return {
		...query,
		groupedByType,
		isEmpty: !query.isLoading && (query.data?.length ?? 0) === 0,
	};
}
