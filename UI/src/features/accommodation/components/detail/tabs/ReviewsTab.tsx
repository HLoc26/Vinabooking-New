import { Paper, Typography, Box, Rating, Avatar, Divider, Button, Stack } from "@mui/material";
import { Star } from "@mui/icons-material";

const mockReviews = [
	{
		id: "rev1",
		star: 5,
		comment: "Excellent location and friendly staff. The rooftop pool is amazing!",
		createdAt: "2025-10-27T10:00:00Z",
		userName: "John Doe",
	},
	{
		id: "rev2",
		star: 4,
		comment: "Good value for money. Room was clean and comfortable.",
		createdAt: "2025-10-26T15:30:00Z",
		userName: "Jane Smith",
	},
	{
		id: "rev3",
		star: 5,
		comment: "Amazing experience! Will definitely come back.",
		createdAt: "2025-10-25T08:00:00Z",
		userName: "Mike Johnson",
	},
	{
		id: "rev4",
		star: 4,
		comment: "Great hotel with excellent facilities. Breakfast was delicious.",
		createdAt: "2025-10-24T12:00:00Z",
		userName: "Sarah Wilson",
	},
];

const averageRating = 4.5;
const totalReviews = mockReviews.length;

export const ReviewsTab = () => {
	return (
		<Paper sx={{ p: 3 }}>
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
				<Typography variant="h6" fontWeight="bold">
					Guest Reviews
				</Typography>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<Star sx={{ color: "#ffa726" }} />
					<Typography variant="h6" fontWeight="bold">
						{averageRating}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						({totalReviews} reviews)
					</Typography>
				</Box>
			</Box>

			<Divider sx={{ mb: 3 }} />

			<Stack spacing={3}>
				{mockReviews.map((review) => (
					<Box key={review.id}>
						<Box sx={{ display: "flex", gap: 2, mb: 1 }}>
							<Avatar sx={{ bgcolor: "primary.main" }}>{review.userName.charAt(0).toUpperCase()}</Avatar>
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

			<Button variant="outlined" fullWidth sx={{ mt: 3 }}>
				Load More Reviews
			</Button>
		</Paper>
	);
};
