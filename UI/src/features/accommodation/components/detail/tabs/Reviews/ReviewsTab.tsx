import { Paper, Typography, Box, Rating, Avatar, Divider, Button, Stack, CircularProgress, Pagination } from "@mui/material";
import { Star, AutoAwesome } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import useUserBookings from "../../../../../booking/hooks/useUserBookings";
import useModalContext from "../../../../../../context/ModalContext/hook";
import ReviewModal from "../../../../../../components/shared/ReviewModal";
import { usePushNotificationContext } from "../../../../../../context/PushNotification/hook";
import { type AccommodationDetail } from "../../../../types/accommodation.types";
import { type Booking } from "../../../../../booking/types/Booking";
import BookingSelectionModal from "./components/BookingSelectionModal";
import { useMemo, useState } from "react";
import { useReviews } from "../../../../hooks/useReviews";
import useAccommodationRooms from "../../../../hooks/useRoomsByAccommodation";
import { authStorage } from "../../../../../auth/utils/authStorage";
import ImageGallery from "../../../../../../components/shared/ImageGallery";
import { getThumbnailUrls } from "../../../../../../utils/image";

interface ReviewsTabProps {
	accommodation: AccommodationDetail;
}

const REVIEWS_PER_PAGE = 5;

export const ReviewsTab = ({ accommodation }: ReviewsTabProps) => {
	const [page, setPage] = useState(1);
	const { data, isLoading: loading, isError: error, refetch } = useReviews(accommodation.id);
	const reviews = useMemo(() => data?.reviews ?? [], [data]);
	const summary = data?.summary;

	const refresh = () => {
		refetch();
	};

	const { paginatedData, totalPages } = useMemo(() => {
		if (!reviews) return { paginatedData: [], totalPages: 0 };

		const start = (page - 1) * REVIEWS_PER_PAGE;
		const end = start + REVIEWS_PER_PAGE;

		return {
			paginatedData: reviews.slice(start, end),
			totalPages: Math.ceil(reviews.length / REVIEWS_PER_PAGE),
		};
	}, [reviews, page]);

	const user = authStorage.getUserSync();

	const userBookings = useUserBookings();
	const { openModal } = useModalContext();
	const { pushNotification } = usePushNotificationContext();

	const totalReviews = reviews.length;
	const averageRating = totalReviews ? reviews.reduce((sum, r) => sum + (r.star ?? 0), 0) / totalReviews : 0;
	const reviewedBookingIds = new Set(reviews.map((r) => r.bookingId));

	const { data: rooms } = useAccommodationRooms(accommodation.id);

	const accommodationRoomIds = rooms ? new Set(rooms.map((r) => r.id)) : new Set();

	const [openGallery, setOpenGallery] = useState(false);
	const [galleryImages, setGalleryImages] = useState<string[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const openImageGallery = (images: string[], index: number) => {
		setGalleryImages(images);
		setCurrentIndex(index);
		setOpenGallery(true);
	};

	const closeGallery = () => setOpenGallery(false);

	const handlePrevImage = () => {
		setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
	};

	const handleNextImage = () => {
		setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
	};

	const unreviewedBookings = userBookings
		.filter((booking) => booking.status === "COMPLETED")
		.filter((booking) => booking.details?.some((d) => accommodationRoomIds.has(d.itemId)))
		.filter((booking) => !reviewedBookingIds.has(booking.id))
		.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()); // sort by most recent first

	const canLeaveReview = user && unreviewedBookings.length > 0;

	const openReviewModal = (booking: Booking) => {
		openModal(
			<ReviewModal
				accommodationId={accommodation.id}
				bookingId={booking.id}
				booking={booking}
				onSuccess={() => {
					refresh();
					pushNotification("Create review successfully", "success");
				}}
			/>
		);
	};

	const handleOpenReview = () => {
		if (!canLeaveReview) return;

		if (unreviewedBookings.length === 1) {
			openReviewModal(unreviewedBookings[0]);
		} else {
			openModal(<BookingSelectionModal bookings={unreviewedBookings} onSelect={openReviewModal} />);
		}
	};

	const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
		setPage(value);
	};

	if (loading) {
		return (
			<Paper sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
				<CircularProgress />
			</Paper>
		);
	}

	if (error) {
		return (
			<Paper sx={{ p: 3, textAlign: "center", minHeight: 200 }}>
				<Typography color="error">Error loading reviews: {error}</Typography>
				<Button onClick={refresh} sx={{ mt: 2 }}>
					Retry
				</Button>
			</Paper>
		);
	}

	return (
		<Paper sx={{ p: 3 }}>
			{/* Header */}
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
				<Typography variant="h6" fontWeight="bold">
					Guest Reviews
				</Typography>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					{canLeaveReview && (
						<Button variant="contained" color="primary" size="small" onClick={handleOpenReview}>
							Write a Review
						</Button>
					)}
					<Star sx={{ color: "#ffa726" }} />
					<Typography variant="h6" fontWeight="bold">
						{averageRating.toFixed(2)}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						({totalReviews} reviews)
					</Typography>
				</Box>
			</Box>

			{summary && (
				<Box
					sx={{
						mb: 3,
						p: 2,
						bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
						borderRadius: 2,
						border: "1px solid",
						borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
						position: "relative",
						overflow: "hidden",
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
						<AutoAwesome sx={{ color: "primary.main", fontSize: 20 }} />
						<Typography variant="subtitle2" fontWeight="bold" color="primary.dark">
							Review Summary
						</Typography>
					</Box>
					<Typography variant="body2" sx={{ fontStyle: "italic", color: "text.primary" }}>
						"{summary}"
					</Typography>
				</Box>
			)}

			<Divider sx={{ mb: 3 }} />

			{/* Review List */}
			<Stack spacing={3}>
				{paginatedData.map((review) => {
					// Prepare full-size image URLs once per review
					return (
						<Box key={review.id}>
							<Box sx={{ display: "flex", gap: 2, mb: 1 }}>
								<Avatar sx={{ bgcolor: "primary.main" }}>{review.user.name?.charAt(0).toUpperCase() || "U"}</Avatar>

								<Box sx={{ flex: 1 }}>
									<Box
										sx={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "start",
										}}
									>
										<Box>
											<Typography variant="subtitle2" fontWeight="bold">
												{review.user.name}
											</Typography>
											<Rating value={review.star} readOnly size="small" />
										</Box>

										<Typography variant="caption" color="text.secondary">
											{new Date(review.commentDate).toLocaleDateString("en-GB", {
												day: "numeric",
												month: "long",
												year: "numeric",
											})}
										</Typography>
									</Box>

									<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
										{review.comment}
									</Typography>

									{/* Images */}
									{review.images?.length > 0 && (
										<Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
											{getThumbnailUrls(review.images).map((img, index) => (
												<Box key={img}>
													<img
														src={img}
														alt="review"
														width={100}
														height={100}
														style={{
															objectFit: "cover",
															borderRadius: 8,
															cursor: "pointer",
														}}
														onClick={() =>
															openImageGallery(
																review.images.map((image) => image.url),
																index
															)
														}
													/>
												</Box>
											))}
										</Stack>
									)}
								</Box>
							</Box>

							<Divider sx={{ mt: 2 }} />
						</Box>
					);
				})}
			</Stack>

			<Stack alignItems="center" mt={3}>
				<Pagination count={totalPages} page={page} onChange={handlePageChange} />
			</Stack>
			<ImageGallery
				galleryImages={galleryImages}
				openGallery={openGallery}
				currentIndex={currentIndex}
				setCurrentIndex={setCurrentIndex}
				closeGallery={closeGallery}
				handlePrevImage={handlePrevImage}
				handleNextImage={handleNextImage}
			/>
		</Paper>
	);
};
