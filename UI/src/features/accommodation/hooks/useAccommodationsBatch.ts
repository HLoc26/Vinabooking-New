import { useQuery } from "@tanstack/react-query";
import { getAccommodationsBatch } from "../accommodationApi";

/**
 * Lấy danh sách accommodation dựa trên mảng IDs
 */
const useAccommodationsBatch = (accommodationIds: string[]) => {
	return useQuery({
		queryKey: ["accommodations", "batch", accommodationIds],
		queryFn: async () => {
			const response = await getAccommodationsBatch(accommodationIds);
			const data = response.data;
			if (!data) throw new Error(response.error as string);

			return data;
		},
		// Chỉ kích hoạt gọi API nếu mảng ids tồn tại và có phần tử
		enabled: Array.isArray(accommodationIds) && accommodationIds.length > 0,
		staleTime: 1000 * 60 * 5, // 5min
	});
};

export default useAccommodationsBatch;
