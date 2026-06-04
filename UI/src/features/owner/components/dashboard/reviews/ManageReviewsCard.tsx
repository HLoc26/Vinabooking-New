import { useState, useMemo, lazy, Suspense, useCallback } from "react";
import { Box, Paper, Typography, Rating, Stack, CircularProgress, LinearProgress, Pagination, alpha } from "@mui/material";
import { StarBorderOutlined, AutoAwesome } from "@mui/icons-material";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";
import { getCardSx, getHeaderSx } from "../shared/CardSharedUI";

import reviewApi from "../../../../review/services/reviewApi";
import { useReviews, type AccommodationReviewsWithImagesResponse } from "../../../../accommodation/hooks/useReviews";
import type { ReviewDto, ReviewWithImages } from "../../../../review/types/review.types";
import { ReviewItem } from "./ReviewItem";

const ImageGallery = lazy(() => import("../../../../../components/shared/ImageGallery"));

type Props = Readonly<{
	accommodationId: string;
}>;

const REVIEWS_PER_PAGE = 5;

const getProgressBarColor = (star: number) => {
	if (star >= 4) return "primary.main";
	if (star === 3) return "warning.main";
	return "error.main";
};

export const ManageReviewsCard = ({ accommodationId }: Props) => {
	const { pushNotification } = usePushNotificationContext();
	const queryClient = useQueryClient();

	const { data, isLoading, isError } = useReviews(accommodationId);
	const reviews = data?.reviews ?? [];
	const summary = data?.summary;

	const { mutateAsync: submitReply } = useMutation({
		mutationFn: async (payload: ReviewDto) => reviewApi.create(payload),
		onMutate: async (newReply) => {
			await queryClient.cancelQueries({ queryKey: ["accommodation", accommodationId, "reviews"] });
			const previousData = queryClient.getQueryData<AccommodationReviewsWithImagesResponse>(["accommodation", accommodationId, "reviews"]);

			queryClient.setQueryData<AccommodationReviewsWithImagesResponse>(["accommodation", accommodationId, "reviews"], (old) => {
				if (!old) return { reviews: [], summary: null };
				return {
					...old,
					reviews: old.reviews.map((r) => {
						if (r.id === newReply.parentId) {
							return {
								...r,
								children: [
									...(r.children || []),
									{
										id: `temp-${Date.now()}`,
										star: 0,
										comment: newReply.comment,
										bookingId: "",
										user: { id: "owner", name: "You (Owner Response)", avatar: "" },
										children: [],
										commentDate: new Date(),
										images: [],
									},
								],
							};
						}
						return r;
					}),
				};
			});

			return { previousData };
		},
		onError: (_err, _newReply, context) => {
			queryClient.setQueryData(["accommodation", accommodationId, "reviews"], context?.previousData);
			pushNotification("Failed to post reply. Please try again.", "error");
		},
		onSuccess: () => pushNotification("Reply posted successfully!", "success"),
		onSettled: () => queryClient.invalidateQueries({ queryKey: ["accommodation", accommodationId, "reviews"] }),
	});

	const [page, setPage] = useState(1);
	const [openGallery, setOpenGallery] = useState(false);
	const [galleryImages, setGalleryImages] = useState<string[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);

	const stats = useMemo(() => {
		const total = reviews.length;
		const avg = total ? reviews.reduce((sum: number, r: ReviewWithImages) => sum + (r.star ?? 0), 0) / total : 0;
		const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
		reviews.forEach((r: ReviewWithImages) => {
			if (r.star && r.star >= 1 && r.star <= 5) counts[r.star as keyof typeof counts]++;
		});
		return { total, avg, counts };
	}, [reviews]);

	const paginatedReviews = useMemo(() => reviews.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE), [reviews, page]);

	const handleExecuteReply = useCallback(
		async (parentId: string, text: string) => {
			await submitReply({ accommodationId, parentId, comment: text });
		},
		[accommodationId, submitReply]
	);

	const openImageGallery = useCallback((images: string[], index: number) => {
		setGalleryImages(images);
		setCurrentIndex(index);
		setOpenGallery(true);
	}, []);

	if (isLoading)
		return (
			<Box display="flex" justifyContent="center" py={6}>
				<CircularProgress />
			</Box>
		);
	if (isError)
		return (
			<Typography color="error" textAlign="center" py={4}>
				Failed to load reviews.
			</Typography>
		);

	return (
		<Paper elevation={0} sx={getCardSx(false)}>
			<Box sx={getHeaderSx(false)}>
				<Box display="flex" alignItems="center" gap={1.5}>
					<Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
						<StarBorderOutlined sx={{ fontSize: "1.1rem", color: "text.secondary" }} />
					</Box>
					<Box>
						<Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} sx={{ fontSize: "0.95rem" }}>
							Guest Reviews & Feedback
						</Typography>
						<Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.75rem" }}>
							Read and respond to your guests' experiences
						</Typography>
					</Box>
				</Box>
			</Box>

			<Box sx={{ px: 3.5, py: 3 }}>
				{summary && (
					<Box
						sx={{
							mb: 4,
							p: 2.5,
							bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
							borderRadius: 3,
							border: "1px solid",
							borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
							position: "relative",
							overflow: "hidden",
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
							<AutoAwesome sx={{ color: "primary.main", fontSize: "1.2rem" }} />
							<Typography variant="subtitle2" fontWeight={700} color="primary.dark">
								AI Review Summary
							</Typography>
						</Box>
						<Typography variant="body2" sx={{ fontStyle: "italic", color: "text.primary", lineHeight: 1.6 }}>
							"{summary}"
						</Typography>
					</Box>
				)}

				{stats.total > 0 && (
					<Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, mb: 4, p: 3, bgcolor: "rgba(255,255,255,0.02)", borderRadius: 3, border: "1px solid rgba(255,255,255,0.05)" }}>
						<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 150 }}>
							<Typography variant="h2" fontWeight={800} color="primary.main" lineHeight={1}>
								{stats.avg.toFixed(1)}
							</Typography>
							<Rating value={stats.avg} precision={0.1} readOnly sx={{ mt: 1, mb: 0.5 }} />
							<Typography variant="body2" color="text.secondary">
								Based on {stats.total} reviews
							</Typography>
						</Box>
						<Box sx={{ flexGrow: 1 }}>
							{[5, 4, 3, 2, 1].map((star) => {
								const percentage = stats.total > 0 ? (stats.counts[star as keyof typeof stats.counts] / stats.total) * 100 : 0;
								return (
									<Box key={star} sx={{ display: "flex", alignItems: "center", mb: 0.5, gap: 2 }}>
										<Typography variant="caption" sx={{ minWidth: 45, fontWeight: 600 }}>
											{star} Stars
										</Typography>
										<LinearProgress
											variant="determinate"
											value={percentage}
											sx={{
												flexGrow: 1,
												height: 6,
												borderRadius: 3,
												bgcolor: "rgba(255,255,255,0.05)",
												"& .MuiLinearProgress-bar": { borderRadius: 3, bgcolor: getProgressBarColor(star) },
											}}
										/>
										<Typography variant="caption" sx={{ minWidth: 20, textAlign: "right", color: "text.disabled" }}>
											{stats.counts[star as keyof typeof stats.counts]}
										</Typography>
									</Box>
								);
							})}
						</Box>
					</Box>
				)}

				{reviews.length === 0 ? (
					<Box textAlign="center" py={6} border="1px dashed rgba(255,255,255,0.1)" borderRadius={3}>
						<Typography color="text.secondary">No reviews yet.</Typography>
					</Box>
				) : (
					<Stack spacing={3}>
						{paginatedReviews.map((review: ReviewWithImages) => (
							<ReviewItem key={review.id} review={review} onReplySubmit={handleExecuteReply} onOpenGallery={openImageGallery} />
						))}
						{Math.ceil(reviews.length / REVIEWS_PER_PAGE) > 1 && (
							<Stack alignItems="center" mt={2}>
								<Pagination count={Math.ceil(reviews.length / REVIEWS_PER_PAGE)} page={page} onChange={(_, val) => setPage(val)} color="primary" />
							</Stack>
						)}
					</Stack>
				)}
			</Box>

			<Suspense fallback={null}>
				{openGallery && (
					<ImageGallery
						openGallery={openGallery}
						galleryImages={galleryImages}
						currentIndex={currentIndex}
						setCurrentIndex={(idx: number | ((prev: number) => number)) => setCurrentIndex((prev) => (typeof idx === "function" ? idx(prev) : idx))}
						closeGallery={() => setOpenGallery(false)}
						handleNextImage={() => setCurrentIndex((prev: number) => (prev + 1) % galleryImages.length)}
						handlePrevImage={() => setCurrentIndex((prev: number) => (prev - 1 + galleryImages.length) % galleryImages.length)}
					/>
				)}
			</Suspense>
		</Paper>
	);
};
