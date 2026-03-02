import { useQuery } from "@tanstack/react-query";
import { getAccommodationByType } from "../accommodationApi";
import type { EAccommodationType } from "../types/accommodation.types";

/**
 * Lấy danh sách accommodation dựa trên type
 */
const useAccommodationsByType = (type: EAccommodationType) => {
	return useQuery({
		queryKey: ["accommodations", "type", type],
		queryFn: async () => {
			const response = await getAccommodationByType(type);
			if (!response) return [];
			const data = response.data?.data;
			if (!data) throw new Error(response.error as string);

			return data;
		},
		staleTime: 1000 * 60 * 60 * 12, // 12h
	});
};

export default useAccommodationsByType;
