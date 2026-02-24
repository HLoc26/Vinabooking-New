import { useQuery } from "@tanstack/react-query";
import { getRoomByAccommodationId } from "../roomApi";

/**
 * To fetch room data by ID, add useLoading
 */
const useAccommodationRooms = (accommodationId: string, startDate?: Date, endDate?: Date) => {
	return useQuery({
		queryKey: ["room", accommodationId, startDate, endDate],
		queryFn: async () => {
			const response = await getRoomByAccommodationId(accommodationId, startDate, endDate);
			if (!response) throw new Error("No data found");
			const data = response.data;
			if (!data) throw new Error(response.error as string);
			return data;
		},
		placeholderData: [],
	});
};
export default useAccommodationRooms;
