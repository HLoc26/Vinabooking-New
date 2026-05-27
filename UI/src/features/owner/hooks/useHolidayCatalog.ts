import { useQuery } from "@tanstack/react-query";
import { getHolidayCatalog } from "../services/ownerPricingApi";

export const useHolidayCatalog = () => {
	return useQuery({
		queryKey: ["holidayCatalog"],
		queryFn: getHolidayCatalog,
		staleTime: 1000 * 60 * 60, // 1 hour
	});
};
