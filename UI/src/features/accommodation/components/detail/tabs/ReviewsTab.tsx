import { Paper, Typography, Box, Rating, Avatar, Divider, Button, Stack, CircularProgress, Pagination } from "@mui/material";
import { Star } from "@mui/icons-material";
import { useAccommodationReview } from "../../../hooks/useAccommodationReview";
import useUserBookings from "../../../../user/hooks/useUserBookings";
import useAuthContextProvider from "../../../../../context/AuthContext/hook";
import useModalContext from "../../../../../context/ModalContext/hook";
import ReviewModal from "../../../../../components/shared/ReviewModal";
import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";
import { type AccommodationDetail } from "../../../types/accommodation.types";
import { type Booking } from "../../../../user/types/Booking";
import BookingSelectionModal from "../../../../../components/shared/BookingSelectionModal";
import { useState } from "react";

interface ReviewsTabProps {
	accommodation: AccommodationDetail;
}

const REVIEWS_PER_PAGE = 5;

export const ReviewsTab = ({ accommodation }: ReviewsTabProps) => {
	const { reviews, loading, error, refresh } = useAccommodationReview(accommodation.id);
	const { getCurrentUser } = useAuthContextProvider();
	const user = getCurrentUser();
	const userBookings = useUserBookings();
	const { openModal } = useModalContext();
	const { pushNotification } = usePushNotificationContext();
	const [page, setPage] = useState(1);

	const reviewedBookingIds = new Set(reviews.map((r) => r.bookingId));
	const accommodationRoomIds = new Set(accommodation.rooms.map((r) => r.id));

	const unreviewedBookings = userBookings
		.filter((booking) => booking.status === "COMPLETED")
		.filter((booking) => booking.details.some((d) => accommodationRoomIds.has(d.itemId)))
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

	const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
		setPage(value);
	};

	const paginatedReviews = reviews.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE);

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

	const totalReviews = reviews.length;
	const averageRating = totalReviews ? reviews.reduce((sum, r) => sum + (r.star ?? 0), 0) / totalReviews : 0;

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
						{averageRating.toFixed(1)}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						({totalReviews} reviews)
					</Typography>
				</Box>
			</Box>

			<Divider sx={{ mb: 3 }} />

			{/* Review List */}
			<Stack spacing={3}>
				{paginatedReviews.map((review) => (
					<Box key={review.id}>
						<Box sx={{ display: "flex", gap: 2, mb: 1 }}>
							<Avatar sx={{ bgcolor: "primary.main" }}>{review.user.name?.charAt(0).toUpperCase() || "U"}</Avatar>
							<Box sx={{ flex: 1 }}>
								<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
									<Box>
										<Typography variant="subtitle2" fontWeight="bold">
											{review.user.name}
										</Typography>
										<Rating value={review.star} readOnly size="small" />
									</Box>
									<Typography variant="caption" color="text.secondary">
										{new Date(review.createdAt).toLocaleDateString("en-GB", {
											day: "numeric",
											month: "long",
											year: "numeric",
										})}
									</Typography>
								</Box>
								<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
									{review.comment}
								</Typography>
							</Box>
						</Box>
						<Divider sx={{ mt: 2 }} />
					</Box>
				))}
			</Stack>

			{totalReviews > REVIEWS_PER_PAGE && (
				<Stack alignItems="center" mt={3}>
					<Pagination count={Math.ceil(totalReviews / REVIEWS_PER_PAGE)} page={page} onChange={handlePageChange} />
				</Stack>
			)}
		</Paper>
	);
};
