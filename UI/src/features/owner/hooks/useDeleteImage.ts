import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteImageApi } from "../services/ownerApi";

export const useDeleteImage = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (imageId: string) => deleteImageApi(imageId),
		onSuccess: () => {
			// You might want to invalidate queries that fetch images
			queryClient.invalidateQueries({ queryKey: ["accommodationImages"] });
			queryClient.invalidateQueries({ queryKey: ["roomImages"] });
		},
	});
};
