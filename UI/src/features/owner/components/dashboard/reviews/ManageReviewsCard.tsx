import { useState, useMemo, lazy, Suspense } from "react";
import { Box, Paper, Typography, Rating, Avatar, Button, Stack, CircularProgress, LinearProgress, TextField, Pagination } from "@mui/material";
import { StarBorderOutlined, ReplyOutlined, Send } from "@mui/icons-material";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";
import { getCardSx, getHeaderSx } from "../shared/CardSharedUI";

import reviewApi from "../../../../review/services/reviewApi";
import { useReviews } from "../../../../accommodation/hooks/useReviews";
import type { ReviewDto, ReviewWithImages } from "../../../../review/types/review.types";
import { getThumbnailUrls } from "../../../../../utils/image";

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

	// 1. FETCH DỮ LIỆU
	const { data: reviews = [], isLoading, isError } = useReviews(accommodationId);

	// 2. MUTATION GỬI REPLY
	const { mutateAsync: submitReply, isPending: isReplying } = useMutation({
		mutationFn: async (payload: ReviewDto) => {
			return reviewApi.create(payload);
		},
		onMutate: async (newReply) => {
			await queryClient.cancelQueries({ queryKey: ["accommodation", accommodationId, "reviews"] });
			const previousReviews = queryClient.getQueryData<ReviewWithImages[]>(["accommodation", accommodationId, "reviews"]);

			queryClient.setQueryData<ReviewWithImages[]>(["accommodation", accommodationId, "reviews"], (old) => {
				if (!old) return [];
				return old.map((r) => {
					if (r.id === newReply.parentId) {
						const optimisticReply: ReviewWithImages = {
							id: `temp-${Date.now()}`,
							star: 0,
							comment: newReply.comment,
							bookingId: "",
							user: { id: "owner", name: "You (Owner Response)", avatar: "" },
							children: [],
							commentDate: new Date(),
							images: [],
						};
						return { ...r, children: [...(r.children || []), optimisticReply] };
					}
					return r;
				});
			});

			return { previousReviews };
		},
		onError: (_err, _newReply, context) => {
			queryClient.setQueryData(["accommodation", accommodationId, "reviews"], context?.previousReviews);
			pushNotification("Failed to post reply. Please try again.", "error");
		},
		onSuccess: () => {
			pushNotification("Reply posted successfully!", "success");
			setReplyingToId(null);
			setReplyText("");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["accommodation", accommodationId, "reviews"] });
		},
	});

	// 3. STATES CỤC BỘ
	const [page, setPage] = useState(1);
	const [replyingToId, setReplyingToId] = useState<string | null>(null);
	const [replyText, setReplyText] = useState("");

	const [openGallery, setOpenGallery] = useState(false);
	const [galleryImages, setGalleryImages] = useState<string[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);

	// 4. TÍNH TOÁN THỐNG KÊ
	const stats = useMemo(() => {
		const total = reviews.length;
		const avg = total ? reviews.reduce((sum: number, r: ReviewWithImages) => sum + (r.star ?? 0), 0) / total : 0;

		const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
		reviews.forEach((r: ReviewWithImages) => {
			if (r.star && r.star >= 1 && r.star <= 5) {
				counts[r.star as keyof typeof counts]++;
			}
		});

		return { total, avg, counts };
	}, [reviews]);

	const paginatedReviews = useMemo(() => {
		const start = (page - 1) * REVIEWS_PER_PAGE;
		return reviews.slice(start, start + REVIEWS_PER_PAGE);
	}, [reviews, page]);

	const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);

	// 5. HÀM XỬ LÝ GỐC
	const handleExecuteReply = async (parentId: string) => {
		if (!replyText.trim()) return;
		await submitReply({
			accommodationId,
			parentId,
			comment: replyText,
		});
	};

	const openImageGallery = (images: string[], index: number) => {
		setGalleryImages(images);
		setCurrentIndex(index);
		setOpenGallery(true);
	};

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
								const count = stats.counts[star as keyof typeof stats.counts];
								const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
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
											{count}
										</Typography>
									</Box>
								);
							})}
						</Box>
					</Box>
				)}

				{reviews.length === 0 ? (
					<Box textAlign="center" py={6} border="1px dashed rgba(255,255,255,0.1)" borderRadius={3}>
						<Typography color="text.secondary">No reviews yet. Check back after your first guests complete their stay!</Typography>
					</Box>
				) : (
					<Stack spacing={3}>
						{paginatedReviews.map((review: ReviewWithImages) => {
							const hasReply = review.children && review.children.length > 0;
							const isReplyingThis = replyingToId === review.id;

							const handleOpenGallery = (index: number) => {
								const urls = review.images ? review.images.map((img: { url: string }) => img.url) : [];
								openImageGallery(urls, index);
							};
							const handleStartReply = () => setReplyingToId(review.id);
							const handleCancelReply = () => {
								setReplyingToId(null);
								setReplyText("");
							};
							const handleSubmitReply = () => handleExecuteReply(review.id);
							const handleReplyChange = (e: React.ChangeEvent<HTMLInputElement>) => setReplyText(e.target.value);

							return (
								<Box
									key={review.id}
									sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(255,255,255,0.08)", transition: "all 0.2s", "&:hover": { bgcolor: "rgba(255,255,255,0.01)" } }}
								>
									<Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
										<Box sx={{ display: "flex", gap: 1.5 }}>
											<Avatar src={review.user?.avatar} sx={{ width: 40, height: 40, bgcolor: "secondary.main" }}>
												{review.user?.name?.charAt(0).toUpperCase() || "U"}
											</Avatar>
											<Box>
												<Typography variant="subtitle2" fontWeight={700}>
													{review.user?.name || "Anonymous Guest"}
												</Typography>
												<Typography variant="caption" color="text.disabled">
													{new Date(review.commentDate || Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
												</Typography>
											</Box>
										</Box>
										<Rating value={review.star} readOnly size="small" />
									</Box>

									<Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
										{review.comment}
									</Typography>

									{review.images && review.images.length > 0 && (
										<Stack direction="row" spacing={1.5} mt={2} mb={1} flexWrap="wrap">
											{getThumbnailUrls(review.images).map((imgUrl: string, index: number) => (
												<Box
													key={imgUrl}
													onClick={() => handleOpenGallery(index)}
													sx={{
														width: 80,
														height: 80,
														borderRadius: 2,
														overflow: "hidden",
														cursor: "pointer",
														border: "1px solid rgba(255,255,255,0.1)",
														transition: "transform 0.2s",
														"&:hover": { transform: "scale(1.05)", borderColor: "primary.main" },
													}}
												>
													<img src={imgUrl} alt="Guest upload" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
												</Box>
											))}
										</Stack>
									)}

									{hasReply ? (
										<Box
											sx={{
												mt: 2,
												ml: 4,
												p: 2,
												bgcolor: "rgba(var(--mui-palette-primary-mainChannel) / 0.05)",
												borderLeft: "3px solid",
												borderColor: "primary.main",
												borderRadius: "0 8px 8px 0",
											}}
										>
											<Box display="flex" justifyContent="space-between" mb={0.5}>
												<Typography variant="caption" fontWeight={700} color="primary.main">
													Your Response
												</Typography>
												<Typography variant="caption" color="text.disabled">
													{new Date(review.children[0].commentDate || Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
												</Typography>
											</Box>
											<Typography variant="body2" color="text.secondary" fontStyle="italic">
												{review.children[0].comment}
											</Typography>
										</Box>
									) : (
										<Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
											{isReplyingThis ? (
												<Box sx={{ width: "100%", mt: 1, p: 2, bgcolor: "rgba(255,255,255,0.02)", borderRadius: 2, border: "1px solid rgba(255,255,255,0.05)" }}>
													<TextField
														fullWidth
														multiline
														rows={3}
														placeholder="Write a polite and professional response..."
														variant="outlined"
														size="small"
														value={replyText}
														onChange={handleReplyChange}
														sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { bgcolor: "background.paper", borderRadius: 2 } }}
													/>
													<Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
														<Button size="small" color="inherit" onClick={handleCancelReply} sx={{ textTransform: "none", fontWeight: 600 }}>
															Cancel
														</Button>
														<Button
															size="small"
															variant="contained"
															color="primary"
															onClick={handleSubmitReply}
															disabled={!replyText.trim() || isReplying}
															startIcon={isReplying ? <CircularProgress size={14} color="inherit" /> : <Send fontSize="small" />}
															sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
														>
															Post Reply
														</Button>
													</Box>
												</Box>
											) : (
												<Button
													size="small"
													variant="text"
													color="inherit"
													startIcon={<ReplyOutlined fontSize="small" />}
													onClick={handleStartReply}
													sx={{ textTransform: "none", fontWeight: 600, color: "text.secondary" }}
												>
													Reply to guest
												</Button>
											)}
										</Box>
									)}
								</Box>
							);
						})}

						{totalPages > 1 && (
							<Stack alignItems="center" mt={2}>
								<Pagination count={totalPages} page={page} onChange={(_, val) => setPage(val)} color="primary" />
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
						setCurrentIndex={(idx: number | ((prev: number) => number)) => setCurrentIndex(typeof idx === "function" ? idx(currentIndex) : idx)}
						closeGallery={() => setOpenGallery(false)}
						handleNextImage={() => setCurrentIndex((prev: number) => (prev + 1) % galleryImages.length)}
						handlePrevImage={() => setCurrentIndex((prev: number) => (prev - 1 + galleryImages.length) % galleryImages.length)}
					/>
				)}
			</Suspense>
		</Paper>
	);
};
