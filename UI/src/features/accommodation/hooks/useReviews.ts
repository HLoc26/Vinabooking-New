import { useQuery } from "@tanstack/react-query";
import { getReviews } from "../reviewApi";

export const useReviews = (accommodationId: string) => {
	return useQuery({
		queryKey: ["accommodation", accommodationId, "reviews"],
		queryFn: async () => {
			const response = await getReviews(accommodationId);
			const data = response.data;
			console.log(response);

			if (!data) {
				return []; // fallback to empty array
			}
			return data;
		},
		staleTime: 1000 * 60 * 10, // 10 mins
		placeholderData: [],
	});
};
