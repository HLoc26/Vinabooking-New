import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publishAccommodation } from "../services/ownerApi";

export const usePublishAccommodation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => publishAccommodation(id),
		onSuccess: () => {
			// Invalidate queries that might be affected by the status change
			queryClient.invalidateQueries({ queryKey: ["owner-accommodations"] });
			queryClient.invalidateQueries({ queryKey: ["draft-accommodations"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
		},
	});
};
