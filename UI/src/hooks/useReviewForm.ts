import { useState, useEffect } from "react";
import reviewApi from "../services/reviewApi";
import type { ReviewData, ReviewDto } from "../types/Review";

interface UseReviewFormProps {
	accommodationId: string;
	bookingId?: string | null;
	parentId?: string | null;
	onSuccess?: () => void;
}
export const useMyReviewByBooking = (bookingId: string) => {
	const [review, setReview] = useState<ReviewData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!bookingId) return;

		reviewApi
			.getMyReviewByBooking(bookingId)
			.then((data) => setReview(data ?? null))
			.finally(() => setLoading(false));
	}, [bookingId]);

	return { review, loading };
};
export const useReviewForm = ({ accommodationId, bookingId, parentId, onSuccess }: UseReviewFormProps) => {
	const [comment, setComment] = useState("");
	const [star, setStar] = useState<number | null>(null);
	const [images, setImages] = useState<File[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isReply = !!parentId;
	const isBookingReview = !!bookingId;

	// XOR validation
	if ((parentId && isBookingReview) || (!parentId && !isBookingReview)) {
		throw new Error("Review must have exactly one of parentId or bookingId");
	}

	const handleSubmit = async () => {
		setError(null);
		setLoading(true);

		const payload: ReviewDto = {
			comment,
			accommodationId,
			parentId: parentId || undefined,
			bookingId: bookingId || undefined,
			star: isReply ? undefined : star,
		};

		try {
			//  Create review
			const createdReview = await reviewApi.create(payload);

			//  Upload images if exist
			if (images.length > 0) {
				await reviewApi.uploadImages("review", createdReview.id, images);
			}

			// reset form
			setComment("");
			setStar(null);
			setImages([]);

			onSuccess?.();
		} catch (err: unknown) {
			const e = err as Error;
			console.error(e);
			setError(e?.message || "Failed to submit review");
		} finally {
			setLoading(false);
		}
	};

	return {
		comment,
		setComment,
		star,
		setStar,
		images,
		setImages,
		loading,
		error,
		isReply,
		handleSubmit,
	};
};
