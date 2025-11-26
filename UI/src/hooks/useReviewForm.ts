import { useState } from "react";
import reviewApi from "../services/reviewApi";
import type { ReviewData } from "../types/Review";

interface UseReviewFormProps {
	accommodationId: string;
	bookingId?: string | null;
	parentId?: string | null;
	onSuccess?: () => void;
}

export const useReviewForm = ({ accommodationId, bookingId, parentId, onSuccess }: UseReviewFormProps) => {
	const [comment, setComment] = useState("");
	const [star, setStar] = useState<number | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isReply = !!parentId;
	const isBookingReview = !!bookingId;

	// kiểm tra XOR: chỉ được có 1 trong 2
	if ((parentId && isBookingReview) || (!parentId && !isBookingReview)) {
		throw new Error("Review must have exactly one of parentId or bookingId");
	}

	const handleSubmit = async () => {
		setError(null);
		setLoading(true);

		const payload: ReviewData = {
			comment,
			accommodationId,
			parentId: parentId || undefined,
			bookingId: bookingId || undefined,
			star: isReply ? undefined : star,
		};

		try {
			await reviewApi.create(payload);
			setComment("");
			setStar(null);
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
		loading,
		error,
		isReply,
		handleSubmit,
	};
};
