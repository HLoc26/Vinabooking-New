import { Paper, Typography, Box, Rating, Avatar, Divider, Button, Stack, CircularProgress } from "@mui/material";
import { Star } from "@mui/icons-material";
import { useAccommodationReview } from "../../../hooks/useAccommodationReview";
import useUserBookings from "../../../../user/hooks/useUserBookings";
import useAuthContextProvider from "../../../../../context/AuthContext/hook";
import useModalContext from "../../../../../context/ModalContext/hook";
import ReviewModal from "../../../../../components/ui/ReviewModal";
import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";
import { type AccommodationDetail } from "../../../types/accommodation.types";

interface ReviewsTabProps {
	accommodation: AccommodationDetail;
}

export const ReviewsTab = ({ accommodation }: ReviewsTabProps) => {
	const { reviews, loading, error, refresh } = useAccommodationReview(accommodation.id);
	const { getCurrentUser } = useAuthContextProvider();
	const user = getCurrentUser();
	const userBookings = useUserBookings();
	const { openModal } = useModalContext();
	const { pushNotification } = usePushNotificationContext();

	const reviewedBookingIds = new Set(reviews.map((r) => r.bookingId));
	const accommodationRoomIds = new Set(accommodation.rooms.map((r) => r.id));

	const unreviewedBookings = userBookings
		.filter((booking) => booking.status === "COMPLETED")
		.filter((booking) => booking.details.some((d) => accommodationRoomIds.has(d.itemId)))
		.filter((booking) => !reviewedBookingIds.has(booking.id));

	const canLeaveReview = user && unreviewedBookings.length > 0;

	const handleOpenReview = () => {
		if (!canLeaveReview) return;

		// Open review for the oldest un-reviewed booking
		const oldestUnreviewedBooking = unreviewedBookings.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

		openModal(
			<ReviewModal
				accommodationId={accommodation.id}
				bookingId={oldestUnreviewedBooking.id}
				onSuccess={() => {
					refresh();
					pushNotification("Create review successfully", "success");
				}}
			/>
		);
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
				{reviews.map((review) => (
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
		</Paper>
	);
};
