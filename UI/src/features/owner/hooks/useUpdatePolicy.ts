import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePolicy } from "../services/ownerApi";
import type { UpdatePolicyDTO } from "../types/owner.types";

export const useUpdatePolicy = (accommodationId: string) => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, UpdatePolicyDTO>({
		mutationFn: (payload) => updatePolicy(accommodationId, payload),

		onSuccess: (_, payload) => {
			// Cache the latest payload
			queryClient.setQueryData(["accommodation", accommodationId, "policy"], payload);
		},

		onError: (err) => {
			console.error("Update policy failed:", err.message);
		},
	});
};
