import React, { type Dispatch, type SetStateAction } from "react";
import { Box, Typography, Checkbox, Divider, CardContent, Card, Button, FormControlLabel } from "@mui/material";
import type { ImageType } from "../services/types/Image";
import { useFetchAccommodationImages } from "../hooks/useFetchAccommodationImages";
import type { RoomInfo } from "../services/types/RoomInfo";
import { useBookingContext } from "../hooks/useBookingContext";
import type { AccommodationInfo } from "../services/types/Accommodation";
import { Apartment, CalendarToday, LocationOn, People } from "@mui/icons-material";

interface Props {
	accommInfo: AccommodationInfo;
	rooms: RoomInfo[];
	agreed: boolean;
	setAgreed: Dispatch<SetStateAction<boolean>>;
	setGalleryImages: Dispatch<SetStateAction<ImageType[]>>;
	openImageGallery: (index: number) => void;
	handleProceed: () => void;
}

const AccommodationInfoBox: React.FC<Props> = ({ accommInfo, rooms, agreed, setAgreed, setGalleryImages, openImageGallery, handleProceed }) => {
	const { context } = useBookingContext();
	const { accomImages, accomImagesLoading } = useFetchAccommodationImages(accommInfo?.id ?? "");

	if (!accommInfo) {
		return <Typography>Accommodation not found</Typography>;
	}

	const totalPrice = rooms.reduce((sum, room) => sum + (Number.parseFloat(room.price) || 0), 0);
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
							alt={accommInfo.name}
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

				<Box display="flex" alignItems="center" gap={1} mb={1}>
					<Apartment fontSize="small" />
					<Typography fontWeight={600}>{accommInfo.name}</Typography>
				</Box>

				<Box display="flex" alignItems="center" gap={1} mb={2}>
					<LocationOn fontSize="small" />
					<Typography variant="body2" color="text.secondary">
						{accommInfo.address.fullAddress}
					</Typography>
				</Box>

				<Divider sx={{ my: 2 }} />

				<Typography variant="h6" mb={2}>
					Check-in / Checkout Date
				</Typography>

				<Box display="flex" alignItems="center" mb={2}>
					<CalendarToday fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
					<Typography variant="body2">
						<strong>Check-in:</strong> {context.startDate.toDateString()}
					</Typography>
				</Box>

				<Box display="flex" alignItems="center" mb={2}>
					<CalendarToday fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
					<Typography variant="body2">
						<strong>Check-out:</strong> {context.endDate.toDateString()}
					</Typography>
				</Box>

				<Box display="flex" alignItems="center" mb={2}>
					<People fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
					<Typography variant="body2">
						<strong>Guests:</strong> {context.guestCount}
					</Typography>
				</Box>

				<Divider sx={{ my: 2 }} />

				<Box mb={3}>
					<Typography variant="h6" mb={1}>
						Total Price
					</Typography>
					<Typography variant="h4" sx={{ color: "text.primary" }} fontWeight={600}>
						${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
					</Typography>
				</Box>

				<Box display="flex" alignItems="flex-start" gap={1} mb={2}>
					<FormControlLabel
						required
						sx={{ p: 0, mt: 0.25 }}
						control={
							<Checkbox //
								checked={agreed}
								onChange={(e) => setAgreed(e.target.checked)}
							/>
						}
						label="I confirm that all the information I provided is correct."
					/>
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
