import React, { useState, useMemo, lazy, Suspense } from "react";
import { Box, Typography, Paper, Divider, Chip } from "@mui/material";
import type { WizardForm, ImageItem, RoomForm } from "../../../types/owner.types";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const ImageGallery = lazy(() => import("../../../../../components/shared/ImageGallery"));

interface CompactImageGalleryProps {
	images: ImageItem[];
	height?: number;
	onImageClick: (index: number) => void;
}

const CompactImageGallery = ({ images, height = 80, onImageClick }: CompactImageGalleryProps) => {
	if (images.length === 0) return null;

	const maxVisible = 5;
	const visibleImages = images.slice(0, maxVisible);
	const remainingCount = images.length - maxVisible;

	return (
		<Box display="flex" gap={1} mt={1.5} sx={{ overflowX: "auto", pb: 0.5, "&::-webkit-scrollbar": { height: 4 }, "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 2 } }}>
			{visibleImages.map((img, index) => {
				const isLast = index === maxVisible - 1 && remainingCount > 0;
				const imageUrl = img.url || (img.file ? URL.createObjectURL(img.file) : "");

				return (
					<Box
						key={img.id}
						onClick={() => onImageClick(index)}
						sx={{
							position: "relative",
							width: height * 1.33,
							height: height,
							borderRadius: 1.5,
							overflow: "hidden",
							cursor: "pointer",
							flexShrink: 0,
							border: "1px solid",
							borderColor: "divider",
							"&:hover img": {
								transform: "scale(1.05)",
							},
						}}
					>
						<Box
							component="img"
							src={imageUrl}
							sx={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
								transition: "transform 0.3s ease",
							}}
						/>
						{isLast && (
							<Box
								sx={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: "100%",
									bgcolor: "rgba(0,0,0,0.6)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									color: "white",
									fontWeight: 700,
									fontSize: "1.1rem",
									backdropFilter: "blur(2px)",
								}}
							>
								+{remainingCount}
							</Box>
						)}
					</Box>
				);
			})}
		</Box>
	);
};

const StepPreviewBox = ({ form }: { form: WizardForm }) => {
	const [galleryState, setGalleryState] = useState<{
		open: boolean;
		images: string[];
		currentIndex: number;
	}>({
		open: false,
		images: [],
		currentIndex: 0,
	});

	const accommodationImages = useMemo(() => form.images.filter((img) => img.target === "accommodation"), [form.images]);

	const getRoomImages = (room: RoomForm) => {
		return form.images.filter((img) => img.target === "room" && (img.roomTempId === room.tempId || (img.roomId && img.roomId === room.id)));
	};

	const handleOpenGallery = (images: ImageItem[], index: number) => {
		const imageUrls = images.map((img) => img.url || (img.file ? URL.createObjectURL(img.file) : ""));
		setGalleryState({
			open: true,
			images: imageUrls,
			currentIndex: index,
		});
	};

	const handleCloseGallery = () => setGalleryState((prev) => ({ ...prev, open: false }));
	return (
		<Box display="flex" flexDirection="column" gap={3}>
			{/* Header */}
			<Box>
				<Typography variant="h6" fontWeight={700}>
					Review Your Listing
				</Typography>
				<Typography variant="body2" color="text.secondary" mt={0.5}>
					Please review the details below. Once you publish, your accommodation will be live for bookings.
				</Typography>
			</Box>

			<Divider />

			{/* Accommodation Section */}
			<Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
				<Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} mb={1}>
					<Box>
						<Typography variant="subtitle1" fontWeight={700}>
							{form.name || "Unnamed Property"}
						</Typography>
						<Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
							<LocationOnOutlinedIcon sx={{ fontSize: 16 }} />
							<Typography variant="caption">{form.address.fullAddress || "No address provided"}</Typography>
						</Box>
					</Box>
					<Box display="flex" gap={1}>
						<Chip label={form.rentalType.replace(/_/g, " ")} color="primary" size="small" />
						<Chip label={form.accommodationType} variant="outlined" size="small" />
					</Box>
				</Box>

				<Typography variant="body2" sx={{ whiteSpace: "pre-line", mb: 2, color: "text.secondary", fontSize: "0.875rem" }}>
					{form.description}
				</Typography>

				<Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
					{form.facilities.map((fac) => (
						<Chip key={fac.id} icon={<CheckCircleOutlineIcon sx={{ fontSize: "14px !important" }} />} label={fac.name} size="small" variant="outlined" sx={{ fontSize: "0.75rem" }} />
					))}
				</Box>

				<Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
					Property Images ({accommodationImages.length})
				</Typography>
				<CompactImageGallery images={accommodationImages} height={100} onImageClick={(idx) => handleOpenGallery(accommodationImages, idx)} />
			</Paper>

			{/* Rooms Section */}
			<Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
				<Typography variant="subtitle2" fontWeight={700} mb={2} display="flex" alignItems="center" gap={1}>
					<MeetingRoomOutlinedIcon color="primary" fontSize="small" /> Rooms ({form.rooms.length})
				</Typography>

				<Box display="flex" flexDirection="column" gap={2}>
					{form.rooms.map((room, idx) => {
						const roomImages = getRoomImages(room);
						return (
							<Box key={room.tempId || idx}>
								<Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
									<Typography variant="subtitle2" fontWeight={600} fontSize="0.875rem">
										{room.name}
									</Typography>
									<Typography variant="caption" fontWeight={700} color="primary">
										{room.price ? `${Number(room.price).toLocaleString()} / ${room.pricingType.toLowerCase()}` : "Price not set"}
									</Typography>
								</Box>
								<Typography variant="caption" color="text.secondary" display="block" mb={1}>
									{room.maxAdults} Adults · {room.maxChildren} Children · {room.bedroomCount} Bedrooms · {room.size} m²
								</Typography>

								<Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
									{room.amenities.map((am) => (
										<Chip key={am.id} label={am.name} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />
									))}
								</Box>

								<CompactImageGallery images={roomImages} height={70} onImageClick={(idx) => handleOpenGallery(roomImages, idx)} />

								{idx < form.rooms.length - 1 && <Divider sx={{ mt: 2 }} />}
							</Box>
						);
					})}
					{form.rooms.length === 0 && (
						<Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
							No rooms added.
						</Typography>
					)}
				</Box>
			</Paper>

			<Suspense fallback={null}>
				{galleryState.open && (
					<ImageGallery
						openGallery={galleryState.open}
						galleryImages={galleryState.images}
						currentIndex={galleryState.currentIndex}
						setCurrentIndex={(idx) =>
							setGalleryState((prev) => ({
								...prev,
								currentIndex: typeof idx === "function" ? idx(prev.currentIndex) : idx,
							}))
						}
						closeGallery={handleCloseGallery}
						handleNextImage={() =>
							setGalleryState((prev) => ({
								...prev,
								currentIndex: (prev.currentIndex + 1) % prev.images.length,
							}))
						}
						handlePrevImage={() =>
							setGalleryState((prev) => ({
								...prev,
								currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
							}))
						}
					/>
				)}
			</Suspense>
		</Box>
	);
};

export default StepPreviewBox;
