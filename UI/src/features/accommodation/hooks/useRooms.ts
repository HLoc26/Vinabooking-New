import { useQuery } from "@tanstack/react-query";
import { getRoomsByMultipleIds } from "../roomApi";

const useRooms = (roomIds: string[]) => {
	return useQuery({
		queryKey: ["rooms", roomIds],
		queryFn: async () => {
			if (!roomIds || roomIds.length === 0) return [];

			const response = await getRoomsByMultipleIds(roomIds);
			const data = response.data;

			if (!data) throw new Error(response.error as string);

			return data;
		},
		enabled: roomIds.length > 0, // prevents running when empty
		staleTime: 1000 * 60 * 5, // 5 minutes (same as accommodation)
	});
};

export default useRooms;
