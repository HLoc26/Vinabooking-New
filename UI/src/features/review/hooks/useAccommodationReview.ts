import { useQuery, useQueryClient } from "@tanstack/react-query";
import reviewApi from "../services/reviewApi";
import type { Review } from "../types/review.types";

interface UseAccommodationReviewResult {
	reviews: Review[];
	loading: boolean;
	error: string | null;
	refresh: () => void;
	// Thêm tham số parentId (optional) vào đây
	addReview: (review: Review, parentId?: string) => void;
}

export const useAccommodationReview = (accommodationId: string): UseAccommodationReviewResult => {
	const queryClient = useQueryClient();
	const queryKey = ["reviews", accommodationId];

	const {
		data: reviews = [],
		isLoading: loading,
		error: queryError,
		refetch: refresh,
	} = useQuery({
		queryKey,
		queryFn: async () => {
			if (!accommodationId) return [];
			const response = await reviewApi.getByAccommodation(accommodationId);
			return response ?? [];
		},
		enabled: !!accommodationId,
		staleTime: 1000 * 60 * 5,
	});

	// Sử dụng tham số parentId được truyền vào từ UI
	const addReview = (review: Review, parentId?: string) => {
		queryClient.setQueryData<Review[]>(queryKey, (prev = []) => {
			if (parentId) {
				// Là reply: tìm review cha dựa theo parentId được truyền vào
				return prev.map((r) => (r.id === parentId ? { ...r, children: [...(r.children || []), review] } : r));
			} else {
				// Là review root mới
				return [review, ...prev];
			}
		});
	};

	return {
		reviews,
		loading,
		error: queryError ? queryError.message : null,
		refresh,
		addReview,
	};
};
