import { Paper, Typography, Box, Rating, Avatar, Divider, Button, Stack, CircularProgress } from "@mui/material";
import { Star } from "@mui/icons-material";
import { useAccommodationReview } from "../../../hooks/useAccommodationReview";

interface ReviewsTabProps {
	accommodationId: string;
}

export const ReviewsTab = ({ accommodationId }: ReviewsTabProps) => {
	const { reviews, loading, error, refresh } = useAccommodationReview(accommodationId);

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
							<Avatar sx={{ bgcolor: "primary.main" }}>{review.userName?.charAt(0).toUpperCase() || "U"}</Avatar>
							<Box sx={{ flex: 1 }}>
								<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
									<Box>
										<Typography variant="subtitle2" fontWeight="bold">
											{review.userName}
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

			{totalReviews > 0 && (
				<Button variant="outlined" fullWidth sx={{ mt: 3 }} onClick={refresh}>
					Load More Reviews
				</Button>
			)}
		</Paper>
	);
};
