import { useQuery } from "@tanstack/react-query";
import { getAccommodationById } from "../accommodationApi";

/**
 * To fetch accommodation data
 */
const useAccommodation = (accommodationId: string) => {
	return useQuery({
		queryKey: ["accommodation", accommodationId],
		queryFn: async () => {
			const response = await getAccommodationById(accommodationId);
			const data = response.data;
			if (!data) throw new Error(response.error as string);

			return data;
		},
		staleTime: 1000 * 60 * 5, // 5min
	});
};

export default useAccommodation;
