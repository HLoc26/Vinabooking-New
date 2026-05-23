import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { getOwnerBookings, revokeOwnerBooking } from "../services/ownerApi";
import type { OwnerBookingFilters } from "../types/owner.types";

export const ownerBookingQueryKeys = {
	all: ["ownerBookings"] as const,
	list: (userId: string | undefined, filters: OwnerBookingFilters) => [...ownerBookingQueryKeys.all, userId, filters] as const,
};

export const useOwnerBookings = (filters: OwnerBookingFilters) => {
	const user = useSelector((state: RootState) => state.auth.user);

	return useQuery({
		queryKey: ownerBookingQueryKeys.list(user?.id, filters),
		queryFn: () => getOwnerBookings(filters),
		enabled: !!user?.id && user.role === "ACCOMMODATION_OWNER",
		staleTime: 1000 * 30,
	});
};

export const useRevokeOwnerBooking = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: revokeOwnerBooking,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ownerBookingQueryKeys.all });
			queryClient.invalidateQueries({ queryKey: ["ownerAccommodations"] });
			queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
		},
	});
};
