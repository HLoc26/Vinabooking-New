import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAccommodationFacilities } from "../services/ownerApi"; // Make sure to add this to your api service
import type { UpdateFacilitiesPayload } from "../types/owner.types"; // Make sure to add this type

export const useUpdateFacilities = (accommodationId: string) => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, UpdateFacilitiesPayload>({
		mutationFn: (payload) => updateAccommodationFacilities(accommodationId, payload),

		onSuccess: (_, payload) => {
			// Cache the latest payload so back-navigation loads instantly
			queryClient.setQueryData(["accommodation", accommodationId, "facilities"], payload);
		},

		onError: (err) => {
			console.error("Update facilities failed:", err.message);
		},
	});
};
