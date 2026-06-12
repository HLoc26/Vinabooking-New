import { useQuery } from "@tanstack/react-query";
import { getReviewImages } from "../reviewApi";
import type { AccommodationReviewsResponse, Review, ReviewWithImages } from "../../review/types/review.types";
import reviewApi from "../../review/services/reviewApi";

export interface AccommodationReviewsWithImagesResponse {
	reviews: ReviewWithImages[];
	summary: string | null;
}

export const useReviews = (accommodationId?: string) => {
	return useQuery<AccommodationReviewsWithImagesResponse>({
		queryKey: ["accommodation", accommodationId, "reviews"],
		enabled: !!accommodationId, // 👈 prevents crash
		queryFn: async () => {
			if (!accommodationId) return { reviews: [], summary: null };

			const response = await reviewApi.getByAccommodation(accommodationId);
			const reviews: Review[] = response?.reviews ?? [];
			const summary = response?.summary ?? null;

			if (!reviews.length) return { reviews: [], summary };

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

			return { reviews: reviewsWithImages, summary };
		},
		staleTime: 1000 * 60 * 10,
		placeholderData: { reviews: [], summary: null },
	});
};
