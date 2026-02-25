import { useQuery } from "@tanstack/react-query";
import { getAccoomodationByRoomId } from "../accommodationApi";

/**
 * To fetch accoommodation data by room ID
 */
const useAccommodationByRoom = (roomId: string) => {
	return useQuery({
		queryKey: ["accommodation", "room", roomId],
		queryFn: async () => {
			const response = await getAccoomodationByRoomId(roomId);
			if (!response) throw new Error("No data found");
			const data = response.data;
			if (!data) throw new Error(response.error as string);
			return data;
		},
	});
};
export default useAccommodationByRoom;
