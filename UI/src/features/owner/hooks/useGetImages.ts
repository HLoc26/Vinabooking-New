import { useQuery } from "@tanstack/react-query";
import { getEntityImages } from "../services/ownerApi";
import type { ImageItem } from "../types/owner.types";

export const useGetImages = (accommodationId?: string, roomIds: string[] = []) => {
	return useQuery<ImageItem[]>({
		queryKey: ["accommodation", accommodationId, "all-images"],
		queryFn: async () => {
			if (!accommodationId) return [];

			const results: ImageItem[] = [];

			// 1. Fetch accommodation images
			try {
				const accomImages = await getEntityImages("accommodation", accommodationId);
				accomImages?.forEach((img) => {
					results.push({
						id: img.id,
						url: img.url,
						target: "accommodation",
					});
				});
			} catch (err) {
				console.error("Failed to fetch accommodation images", err);
			}

			// 2. Fetch room images
			await Promise.all(
				roomIds.map(async (roomId) => {
					try {
						const roomImages = await getEntityImages("room", roomId);
						roomImages?.forEach((img) => {
							results.push({
								id: img.id,
								url: img.url,
								target: "room",
								roomId: roomId,
							});
						});
					} catch (err) {
						console.error(`Failed to fetch images for room ${roomId}`, err);
					}
				})
			);

			return results;
		},
		enabled: !!accommodationId,
		staleTime: 5 * 60 * 1000,
	});
};
