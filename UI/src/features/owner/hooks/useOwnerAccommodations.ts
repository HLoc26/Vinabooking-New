import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { AxiosError } from "axios";
import type { RootState } from "../../../app/store";
import { getOwnerAccommodations } from "../services/ownerApi";
import { EAccommodationStatus } from "../../accommodation/types/accommodation.types";

export const useOwnerAccommodations = () => {
	const user = useSelector((state: RootState) => state.auth.user);

	return useQuery({
		queryKey: ["ownerAccommodations", user?.id],
		queryFn: async () => {
			const data = await getOwnerAccommodations();
			return data;
		},
		select: (data) => data?.filter((acc) => acc.status !== EAccommodationStatus.DRAFT) ?? [],
		enabled: !!user?.id && user.role === "ACCOMMODATION_OWNER",
		staleTime: 1000 * 60 * 5,
		retry: (failureCount, error: AxiosError) => {
			if (error?.response?.status === 404) return false;
			if (error?.response?.status === 403) return false;
			return failureCount < 2;
		},
	});
};
