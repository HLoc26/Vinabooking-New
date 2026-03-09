import { useQuery } from "@tanstack/react-query";
import { getReviewImages } from "../reviewApi";
import type { Review, ReviewWithImages } from "../../review/types/review.types";
import reviewApi from "../../review/services/reviewApi";

export const useReviews = (accommodationId?: string) => {
	return useQuery<ReviewWithImages[]>({
		queryKey: ["accommodation", accommodationId, "reviews"],
		enabled: !!accommodationId, // 👈 prevents crash
		queryFn: async () => {
			if (!accommodationId) return [];

			const response = await reviewApi.getByAccommodation(accommodationId);
			const reviews: Review[] = response ?? [];

			if (!reviews.length) return [];

			const reviewsWithImages: ReviewWithImages[] = await Promise.all(
				reviews.map(async (review) => {
					try {
						const images = await getReviewImages(review.id);

						return {
							...review,
							images: images ?? [],
						};
					} catch {
						return {
							...review,
							images: [],
						};
					}
				})
			);

			return reviewsWithImages;
		},
		staleTime: 1000 * 60 * 10,
		placeholderData: [],
	});
};
