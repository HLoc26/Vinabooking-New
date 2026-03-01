import { useQuery } from "@tanstack/react-query";
import { getStats } from "../accommodationApi";

const useAccommodationStats = () => {
	return useQuery({
		queryKey: ["accommodation", "stats"],
		queryFn: async () => {
			const response = await getStats();
			const data = response.data;
			if (!data) throw new Error(response.error as string);

			return data;
		},
		staleTime: 1000 * 60 * 60 * 12, // 12h
	});
};

export default useAccommodationStats;
