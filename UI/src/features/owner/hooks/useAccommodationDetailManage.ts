import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getAccommodationDraftDetail } from "../services/ownerApi";

export const useAccommodationDetailManage = (id: string | undefined) => {
	return useQuery({
		queryKey: ["accommodationManage", id],
		queryFn: async () => {
			if (!id) throw new Error("Accommodation ID is required");
			return await getAccommodationDraftDetail(id);
		},
		enabled: !!id,
		staleTime: 1000 * 60 * 5,
		retry: (failureCount, error: AxiosError) => {
			if (error?.response?.status === 404) return false;
			if (error?.response?.status === 403) return false;
			return failureCount < 2;
		},
	});
};
