import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAccommodation } from "../services/ownerApi";
import type { AccommodationSummary, UpdateAccommodationPayload } from "../types/owner.types";

export const useUpdateBasicAccom = (accommodationId: string) => {
	const queryClient = useQueryClient();

	return useMutation<AccommodationSummary, Error, UpdateAccommodationPayload>({
		mutationFn: (payload) => updateAccommodation(accommodationId, payload),

		onSuccess: (data) => {
			queryClient.setQueryData(["accommodation", accommodationId, "basic"], data);
		},

		onError: (err) => {
			console.error("Update accommodation failed:", err.message);
		},
	});
};
