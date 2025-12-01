import { useState } from "react";
import { Paper, Box, Typography, IconButton, Chip, Button } from "@mui/material";
import { Person, Hotel, SquareFoot, Bathtub, Visibility, Remove, Add, ChevronLeft, ChevronRight, ExpandMore, ExpandLess } from "@mui/icons-material";

import type { AccommodationDetail } from "../../types/accommodation.types";
import { getViewTypeLabel } from "../../constants/viewTypes";

import useModalContext from "../../../../context/ModalContext/hook";
import RoomDetailModal from "./RoomDetailModal";

interface Props {
	room: AccommodationDetail["rooms"][0];
	quantity: number;
	availableRooms: number;
	onIncrease: () => void;
	onDecrease: () => void;
}

export const RoomCard = ({ room, quantity, availableRooms, onIncrease, onDecrease }: Props) => {
	const isLowStock = availableRooms <= 3;
	const price = Math.floor(parseFloat(room.price));

	const { openModal } = useModalContext();

	// Image carousel state
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const primaryImages = room.images.filter((img) => img.variant === "ORIGINAL");

	// Amenities expand state
	const [showAllAmenities, setShowAllAmenities] = useState(false);
	const visibleAmenitiesCount = 6;
	const hasMoreAmenities = room.amenities.length > visibleAmenitiesCount;

	const handleNextImage = () => {
		setCurrentImageIndex((prev) => (prev + 1) % primaryImages.length);
	};

	const handlePrevImage = () => {
		setCurrentImageIndex((prev) => (prev - 1 + primaryImages.length) % primaryImages.length);
	};

	const handleRoomNameClick = () => {
		openModal(<RoomDetailModal room={room} />);
	};

	return (
		<Paper
			elevation={0}
			sx={{
				mb: 2.5,
				borderRadius: 3,
				border: "1.5px solid",
				borderColor: quantity > 0 ? "primary.main" : "grey.200",
				overflow: "hidden",
				transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
				position: "relative",
				bgcolor: quantity > 0 ? "primary.50" : "background.paper",
				"&:hover": {
					borderColor: "primary.main",
					boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)",
					transform: "translateY(-2px)",
				},
			}}
		>
			<Box sx={{ display: "flex", flexDirection: "column" }}>
				{/* Image Carousel Section - Full width on top */}
				{primaryImages.length > 0 && (
					<Box
						sx={{
							position: "relative",
							width: "100%",
							height: { xs: "220px", sm: "280px", md: "320px" },
							bgcolor: "grey.100",
							overflow: "hidden",
						}}
					>
						<Box
							component="img"
							src={primaryImages[currentImageIndex]?.url}
							alt={`${room.name} - Image ${currentImageIndex + 1}`}
							sx={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
							}}
						/>

						{/* Image navigation */}
						{primaryImages.length > 1 && (
							<>
								<IconButton
									onClick={handlePrevImage}
									sx={{
										position: "absolute",
										left: 12,
										top: "50%",
										transform: "translateY(-50%)",
										bgcolor: "rgba(255, 255, 255, 0.95)",
										boxShadow: 2,
										width: 40,
										height: 40,
										"&:hover": {
											bgcolor: "white",
											transform: "translateY(-50%) scale(1.05)",
										},
										transition: "all 0.2s",
									}}
								>
									<ChevronLeft />
								</IconButton>

								<IconButton
									onClick={handleNextImage}
									sx={{
										position: "absolute",
										right: 12,
										top: "50%",
										transform: "translateY(-50%)",
										bgcolor: "rgba(255, 255, 255, 0.95)",
										boxShadow: 2,
										width: 40,
										height: 40,
										"&:hover": {
											bgcolor: "white",
											transform: "translateY(-50%) scale(1.05)",
										},
										transition: "all 0.2s",
									}}
								>
									<ChevronRight />
								</IconButton>

								{/* Image indicators */}
								<Box
									sx={{
										position: "absolute",
										bottom: 16,
										left: "50%",
										transform: "translateX(-50%)",
										display: "flex",
										gap: 0.75,
										bgcolor: "rgba(0, 0, 0, 0.6)",
										borderRadius: 2,
										px: 1.5,
										py: 0.75,
										backdropFilter: "blur(4px)",
									}}
								>
									{primaryImages.map((_, idx) => (
										<Box
											key={idx}
											sx={{
												width: idx === currentImageIndex ? 24 : 8,
												height: 8,
												borderRadius: 1,
												bgcolor: idx === currentImageIndex ? "white" : "rgba(255, 255, 255, 0.5)",
												transition: "all 0.3s",
												cursor: "pointer",
												"&:hover": {
													bgcolor: "rgba(255, 255, 255, 0.8)",
												},
											}}
											onClick={() => setCurrentImageIndex(idx)}
										/>
									))}
								</Box>

								{/* Image counter */}
								<Box
									sx={{
										position: "absolute",
										top: 16,
										right: 16,
										bgcolor: "rgba(0, 0, 0, 0.7)",
										color: "white",
										px: 1.5,
										py: 0.5,
										borderRadius: 1.5,
										fontSize: "0.875rem",
										fontWeight: 600,
										backdropFilter: "blur(4px)",
									}}
								>
									{currentImageIndex + 1} / {primaryImages.length}
								</Box>
							</>
						)}
					</Box>
				)}

				{/* Content Section */}
				<Box sx={{ p: { xs: 2.5, sm: 3 } }}>
					{/* Header section */}
					<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, gap: 3 }}>
						<Box sx={{ flex: 1 }}>
							<Typography
								variant="h6"
								fontWeight={600}
								sx={{
									mb: 1,
									fontSize: { xs: "1.15rem", sm: "1.3rem" },
									color: "text.primary",
									cursor: "pointer",
									display: "inline-block",
									position: "relative",
									"&:hover": {
										color: "primary.main",
										"&::after": {
											width: "100%",
										},
									},
									"&::after": {
										content: '""',
										position: "absolute",
										bottom: -2,
										left: 0,
										width: 0,
										height: 2,
										bgcolor: "primary.main",
										transition: "width 0.3s",
									},
								}}
								onClick={handleRoomNameClick}
							>
								{room.name}
							</Typography>
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{
									lineHeight: 1.7,
									fontSize: "0.9rem",
								}}
							>
								{room.description}
							</Typography>
						</Box>

						<Box sx={{ textAlign: "right", pl: 2 }}>
							<Typography
								variant="h4"
								fontWeight={700}
								color="primary.main"
								sx={{
									lineHeight: 1,
									fontSize: { xs: "1.75rem", sm: "2rem" },
								}}
							>
								${price}
							</Typography>
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{
									fontSize: "0.8rem",
									display: "block",
									mt: 0.5,
								}}
							>
								per night
							</Typography>
						</Box>
					</Box>

					{/* Room features - Optimized for scanning */}
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(auto-fit, minmax(140px, 1fr))" },
							gap: 2,
							mb: 3,
						}}
					>
						<Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
							<Person sx={{ fontSize: 22, color: "primary.main", mt: 0.25, flexShrink: 0 }} />
							<Box>
								<Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.4, color: "text.primary" }}>
									{room.maxAdults} {room.maxAdults === 1 ? "Guest" : "Guests"}
								</Typography>
								{room.maxChildren > 0 && (
									<Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
										+{room.maxChildren} {room.maxChildren === 1 ? "child" : "children"}
									</Typography>
								)}
							</Box>
						</Box>

						<Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
							<Hotel sx={{ fontSize: 22, color: "primary.main", mt: 0.25, flexShrink: 0 }} />
							<Box>
								<Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.4, color: "text.primary" }}>
									{room.beds.length} {room.beds.length === 1 ? "Bed" : "Beds"}
								</Typography>
								{room.beds.length > 0 && (
									<Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
										{room.beds[0].bedType}
									</Typography>
								)}
							</Box>
						</Box>

						<Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
							<SquareFoot sx={{ fontSize: 22, color: "primary.main", mt: 0.25, flexShrink: 0 }} />
							<Box>
								<Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.4, color: "text.primary" }}>
									{room.size} m²
								</Typography>
								<Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
									Room size
								</Typography>
							</Box>
						</Box>

						<Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
							<Bathtub sx={{ fontSize: 22, color: "primary.main", mt: 0.25, flexShrink: 0 }} />
							<Box>
								<Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.4, color: "text.primary" }}>
									{room.bathroomCount} {room.bathroomCount === 1 ? "Bathroom" : "Bathrooms"}
								</Typography>
								<Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
									Private
								</Typography>
							</Box>
						</Box>

						{room.viewType && (
							<Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
								<Visibility sx={{ fontSize: 22, color: "primary.main", mt: 0.25, flexShrink: 0 }} />
								<Box>
									<Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.4, color: "text.primary" }}>
										{getViewTypeLabel(room.viewType)}
									</Typography>
									<Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
										View
									</Typography>
								</Box>
							</Box>
						)}
					</Box>

					{/* Amenities section */}
					{room.amenities.length > 0 && (
						<Box sx={{ mb: 3 }}>
							<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
								{room.amenities.slice(0, showAllAmenities ? undefined : visibleAmenitiesCount).map((a) => (
									<Chip
										key={a.id}
										label={a.amenity.name}
										size="small"
										variant="outlined"
										sx={{
											height: 26,
											fontSize: "0.75rem",
											borderColor: "grey.300",
											bgcolor: "background.paper",
											"&:hover": {
												borderColor: "primary.main",
												bgcolor: "primary.50",
											},
										}}
									/>
								))}
							</Box>

							{/* Show more/less button */}
							{hasMoreAmenities && (
								<Button
									size="small"
									onClick={() => setShowAllAmenities(!showAllAmenities)}
									endIcon={showAllAmenities ? <ExpandLess /> : <ExpandMore />}
									sx={{
										mt: 1,
										textTransform: "none",
										fontSize: "0.8rem",
										fontWeight: 600,
										color: "primary.main",
										"&:hover": {
											bgcolor: "primary.50",
										},
									}}
								>
									{showAllAmenities ? "Show less" : `Show ${room.amenities.length - visibleAmenitiesCount} more amenities`}
								</Button>
							)}
						</Box>
					)}

					{/* Footer - Availability & Quantity control */}
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							pt: 2.5,
							borderTop: "1px solid",
							borderColor: "grey.200",
							gap: 2,
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<Box
								sx={{
									width: 8,
									height: 8,
									borderRadius: "50%",
									bgcolor: isLowStock ? "warning.main" : "success.main",
									flexShrink: 0,
								}}
							/>
							<Typography variant="body2" fontWeight={600} color={isLowStock ? "warning.dark" : "success.dark"} sx={{ fontSize: "0.875rem" }}>
								{availableRooms === 1 ? "Last room!" : `${availableRooms} rooms left`}
							</Typography>
						</Box>

						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1,
								bgcolor: "background.paper",
								borderRadius: 2.5,
								p: 0.5,
								border: "1px solid",
								borderColor: quantity > 0 ? "primary.main" : "grey.300",
							}}
						>
							<IconButton
								size="small"
								onClick={onDecrease}
								disabled={quantity === 0}
								sx={{
									width: 36,
									height: 36,
									color: "text.secondary",
									"&:hover": {
										bgcolor: "grey.100",
									},
									"&:disabled": {
										color: "action.disabled",
									},
								}}
							>
								<Remove fontSize="small" />
							</IconButton>

							<Typography
								variant="h6"
								fontWeight={700}
								sx={{
									minWidth: 40,
									textAlign: "center",
									fontSize: "1.1rem",
									color: quantity > 0 ? "primary.main" : "text.secondary",
								}}
							>
								{quantity}
							</Typography>

							<IconButton
								size="small"
								onClick={onIncrease}
								disabled={quantity >= availableRooms}
								sx={{
									width: 36,
									height: 36,
									bgcolor: "primary.main",
									color: "white",
									"&:hover": {
										bgcolor: "primary.dark",
									},
									"&:disabled": {
										bgcolor: "action.disabledBackground",
										color: "action.disabled",
									},
								}}
							>
								<Add fontSize="small" />
							</IconButton>
						</Box>
					</Box>
				</Box>
			</Box>
		</Paper>
	);
};
