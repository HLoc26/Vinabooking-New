import React, { type Dispatch, type SetStateAction } from "react";
import { Box, Typography, Checkbox, Divider, CardContent, Card, Button } from "@mui/material";
import type { BookingDto } from "../services/types/BookingDto";
import type { ImageType } from "../services/types/Image";
import { useFetchAccommodationImages } from "../hooks/useFetchAccommodationImages";

interface Props {
	booking: BookingDto;
	agreed: boolean;
	setAgreed: Dispatch<SetStateAction<boolean>>;
	setGalleryImages: Dispatch<SetStateAction<ImageType[]>>;
	openImageGallery: (index: number) => void;
	handleProceed: () => void;
}

const AccommodationInfoBox: React.FC<Props> = ({ booking, agreed, setAgreed, setGalleryImages, openImageGallery, handleProceed }) => {
	const { accomImages, accomImagesLoading } = useFetchAccommodationImages(booking.room[0].id);

	const totalPrice = booking.room.reduce((sum, room) => sum + (room.price || 0), 0);
	const webp = accomImages.filter((i) => i.variant === "WEBP");
	const thumbnails = accomImages.filter((i) => i.variant === "THUMBNAIL");

	const mainThumbnail = thumbnails[0];
	const gridThumbnails = thumbnails.slice(1, 5); // tối đa 4 ảnh

	// Overlay +N xuất hiện nếu còn nhiều ảnh hơn grid hiển thị
	const remainingCount = webp.length - 4;

	return (
		<Card>
			<CardContent>
				<Typography variant="h6" mb={2}>
					Accommodation Information
				</Typography>

				{/* Accommodation Image Gallery Preview */}
				{accomImages.length > 0 && (
					<Box sx={{ mb: 2 }}>
						{/* Main Image */}
						<Box
							component="img"
							src={mainThumbnail.url}
							alt={booking.accommodation.name}
							onClick={() => {
								setGalleryImages(webp);
								setTimeout(() => openImageGallery(0), 0);
							}}
							sx={{
								width: "100%",
								height: 150,
								objectFit: "cover",
								borderRadius: 2,
								cursor: "pointer",
								mb: 1,
							}}
						/>

						{/* Thumbnail Grid (if more than 1 image) */}
						{accomImages.length > 1 && (
							<Box
								sx={{
									display: "grid",
									gridTemplateColumns: "repeat(4, 1fr)",
									gap: 0.5,
									position: "relative",
								}}
							>
								{gridThumbnails.map((img, idx) => (
									<Box
										key={idx}
										component="img"
										src={img.url}
										alt={`Accommodation ${idx + 2}`}
										onClick={() => {
											setGalleryImages(webp);
											setTimeout(() => openImageGallery(idx + 1), 0);
										}}
										sx={{
											width: "100%",
											height: 60,
											objectFit: "cover",
											borderRadius: 1,
											cursor: "pointer",
										}}
									/>
								))}
								{/* Show +N overlay on last thumbnail if more images exist */}
								{webp.length > 4 && (
									<Box
										sx={{
											position: "absolute",
											bottom: 0,
											right: 0,
											width: "calc(25% - 2px)",
											height: 60,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											bgcolor: "rgba(0,0,0,0.6)",
											color: "white",
											borderRadius: 1,
											cursor: "pointer",
											fontWeight: 600,
										}}
										onClick={() => {
											setGalleryImages(webp);
											setTimeout(() => openImageGallery(4), 0);
										}}
									>
										+{remainingCount}
									</Box>
								)}
							</Box>
						)}
					</Box>
				)}

				{/* Loading/No Image State */}
				{accomImages.length === 0 && (
					<Box
						sx={{
							width: "100%",
							height: 150,
							bgcolor: "#f0f0f0",
							borderRadius: 2,
							mb: 2,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						{accomImagesLoading ? (
							<Typography variant="caption" color="text.secondary">
								Loading...
							</Typography>
						) : (
							<Typography variant="caption" color="text.secondary">
								No Image
							</Typography>
						)}
					</Box>
				)}

				<Typography fontWeight={600} mb={0.5}>
					{booking.accommodation.name}
				</Typography>
				<Typography variant="body2" color="text.secondary" mb={2}>
					{booking.accommodation.address}
				</Typography>

				<Divider sx={{ my: 2 }} />

				<Typography variant="h6" mb={2}>
					Check-in / Checkout Date
				</Typography>
				<Typography variant="body2" mb={1}>
					<strong>Check-in:</strong> {booking.startDate.toDateString()}
				</Typography>
				<Typography variant="body2" mb={1}>
					<strong>Check-out:</strong> {booking.endDate.toDateString()}
				</Typography>
				<Typography variant="body2" mb={3}>
					<strong>Guests:</strong> {booking.guestCount}
				</Typography>

				<Divider sx={{ my: 2 }} />

				<Box mb={3}>
					<Typography variant="h6" mb={1}>
						Total Price
					</Typography>
					<Typography variant="h4" sx={{ color: "warning.main" }} fontWeight={600}>
						${totalPrice}
					</Typography>
				</Box>

				<Box display="flex" alignItems="flex-start" gap={1} mb={2}>
					<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} sx={{ p: 0, mt: 0.25 }} />
					<Typography variant="body2" sx={{ lineHeight: 1.6 }}>
						I confirm that all the information I provided is correct.
					</Typography>
				</Box>

				<Button
					variant="contained"
					fullWidth
					sx={{
						py: 1.5,
						bgcolor: "warning.main",
						"&:hover": { bgcolor: "warning.dark" },
					}}
					onClick={handleProceed}
				>
					Proceed to Payment
				</Button>
			</CardContent>
		</Card>
	);
};

export default AccommodationInfoBox;
