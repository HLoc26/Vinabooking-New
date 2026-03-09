import { useQuery } from "@tanstack/react-query";
import { getOwnerInfo } from "../services/ownerApi";
import type { OwnerProfileData } from "../types/owner.types";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import type { AxiosError } from "axios";

export const useOwnerInfo = () => {
	const user = useSelector((state: RootState) => state.auth.user);

	return useQuery({
		queryKey: ["ownerProfile", user?.id],
		queryFn: async () => {
			const data = await getOwnerInfo();

			if (!data) {
				throw new Error("User does not have owner profile.");
			}

			return data as OwnerProfileData;
		},
		// Only enable when user is logged in
		enabled: !!user?.id && user.role === "ACCOMMODATION_OWNER",
		staleTime: 1000 * 60 * 5, // 5 min
		retry: (failureCount, error: AxiosError) => {
			// If 404 (no profile) -> dont retry, return error
			if (error?.response?.status === 404) return false;
			if (error?.response?.status === 403) return false;
			return failureCount < 2;
		},
	});
};
