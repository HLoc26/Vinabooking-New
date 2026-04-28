import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAccommodation } from "../services/ownerApi";
import type { AccommodationSummary, CreateAccommodationPayload } from "../types/owner.types";

export const useCreateBasicAccom = () => {
	const queryClient = useQueryClient();

	return useMutation<AccommodationSummary, Error, CreateAccommodationPayload>({
		mutationFn: createAccommodation,

		onSuccess: (data) => {
			queryClient.setQueryData(["accommodation", data.id], data);
		},

		onError: (err) => {
			console.error("Create accommodation failed:", err.message);
		},
	});
};
