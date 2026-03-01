import { useEffect, useState } from "react";
import reviewApi from "../../../services/reviewApi";
import type { ReviewData } from "../../../types/Review";

interface UseAccommodationReviewResult {
	reviews: ReviewData[];
	loading: boolean;
	error: string | null;
	refresh: () => void;
	addReview: (review: ReviewData) => void;
}

export const useAccommodationReview = (accommodationId: string): UseAccommodationReviewResult => {
	const [reviews, setReviews] = useState<ReviewData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const fetchReviews = async () => {
		if (!accommodationId) return;
		setLoading(true);
		setError(null);

		try {
			const response = await reviewApi.getByAccommodation(accommodationId);
			// API trả về mảng ReviewData
			setReviews(response ?? []);
		} catch (err: unknown) {
			const e = err as Error;
			console.error(e);
			setError(e?.message || "Failed to fetch reviews");
		} finally {
			setLoading(false);
		}
	};

	// append review mới (ReviewData) mà không reload toàn bộ
	const addReview = (review: ReviewData) => {
		if (review.parentId) {
			// là reply: tìm review cha và thêm vào children
			setReviews((prev) => prev.map((r) => (r.id === review.parentId ? { ...r, children: [...r.children, review] } : r)));
		} else {
			// là review mới
			setReviews((prev) => [review, ...prev]);
		}
	};

	useEffect(() => {
		fetchReviews();
	}, [accommodationId]);

	return { reviews, loading, error, refresh: fetchReviews, addReview };
};
