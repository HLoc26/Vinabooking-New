import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAccommodationAddress } from "../services/ownerApi";
import type { UpdateAddressPayload } from "../types/owner.types";

export const useUpdateAddress = (accommodationId: string) => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, UpdateAddressPayload>({
		mutationFn: (payload) => updateAccommodationAddress(accommodationId, payload),

		onSuccess: (_, payload) => {
			// Cache the latest payload so back-navigation loads instantly
			queryClient.setQueryData(["accommodation", accommodationId, "address"], payload);
		},

		onError: (err) => {
			console.error("Update address failed:", err.message);
		},
	});
};
