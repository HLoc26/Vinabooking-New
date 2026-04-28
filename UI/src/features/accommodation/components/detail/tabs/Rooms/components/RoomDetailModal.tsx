import { useState } from "react";
import { Box, Chip, DialogActions, DialogContent, DialogTitle, IconButton, Typography, Button, Stack, Divider } from "@mui/material";
import { Close, Person, Hotel, SquareFoot, Bathtub, Visibility, ChevronLeft, ChevronRight } from "@mui/icons-material";

import { getViewTypeLabel } from "../../../../../constants/viewTypes";
import useModalContext from "../../../../../../../context/ModalContext/hook";
import type { Room } from "../../../../../types/room.types";

interface RoomDetailModalProps {
	room: Room;
}

const RoomDetailModal = ({ room }: RoomDetailModalProps) => {
	const { closeModal } = useModalContext();

	const primaryImages = room.images.filter((img) => img.variants.some((v) => v.variant === "ORIGINAL"));
	const price = Math.floor(parseFloat(room.price));

	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	const handleNextImage = () => {
		if (primaryImages.length === 0) return;
		setCurrentImageIndex((prev) => (prev + 1) % primaryImages.length);
	};

	const handlePrevImage = () => {
		if (primaryImages.length === 0) return;
		setCurrentImageIndex((prev) => (prev - 1 + primaryImages.length) % primaryImages.length);
	};

	return (
		<>
			<DialogTitle
				component="div"
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					pr: 6,
					py: 1.5,
				}}
			>
				<Box sx={{ pr: 2, overflow: "hidden" }}>
					<Typography variant="h6" fontWeight={700} noWrap>
						{room.name}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Room photos & details
					</Typography>
				</Box>

				<IconButton
					onClick={closeModal}
					sx={{
						position: "absolute",
						right: 8,
						top: 8,
					}}
				>
					<Close />
				</IconButton>
			</DialogTitle>

			<DialogContent
				dividers
				sx={{
					p: 1.5,
				}}
			>
				{/* Image gallery */}
				<Box
					sx={{
						position: "relative",
						width: "100%",
						height: 230,
						bgcolor: "grey.100",
						borderRadius: 2.5,
						overflow: "hidden",
						mb: 1.5,
					}}
				>
					{primaryImages.length > 0 ? (
						<Box
							component="img"
							src={primaryImages[currentImageIndex]?.url}
							alt={`${room.name} - Image ${currentImageIndex + 1}`}
							sx={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
								display: "block",
							}}
						/>
					) : (
						<Box
							sx={{
								width: "100%",
								height: "100%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "text.secondary",
								fontSize: "0.9rem",
							}}
						>
							No images available
						</Box>
					)}

					{/* Controls + indicator */}
					{primaryImages.length > 1 && (
						<>
							<IconButton
								onClick={handlePrevImage}
								sx={{
									position: "absolute",
									left: 8,
									top: "50%",
									transform: "translateY(-50%)",
									bgcolor: "rgba(255, 255, 255, 0.95)",
									boxShadow: 1,
									width: 34,
									height: 34,
									"&:hover": {
										bgcolor: "white",
									},
								}}
								size="small"
							>
								<ChevronLeft fontSize="small" />
							</IconButton>

							<IconButton
								onClick={handleNextImage}
								sx={{
									position: "absolute",
									right: 8,
									top: "50%",
									transform: "translateY(-50%)",
									bgcolor: "rgba(255, 255, 255, 0.95)",
									boxShadow: 1,
									width: 34,
									height: 34,
									"&:hover": {
										bgcolor: "white",
									},
								}}
								size="small"
							>
								<ChevronRight fontSize="small" />
							</IconButton>

							<Box
								sx={{
									position: "absolute",
									bottom: 10,
									right: 10,
									bgcolor: "rgba(0,0,0,0.6)",
									color: "white",
									px: 1,
									py: 0.25,
									borderRadius: 999,
									fontSize: "0.75rem",
									fontWeight: 600,
								}}
							>
								{currentImageIndex + 1} / {primaryImages.length}
							</Box>
						</>
					)}
				</Box>

				{/* Price */}
				<Box
					sx={{
						display: "flex",
						alignItems: "baseline",
						justifyContent: "space-between",
						mb: 1.5,
						gap: 1,
					}}
				>
					<Box>
						<Typography variant="h5" fontWeight={700} color="primary.main">
							${price}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							per night
						</Typography>
					</Box>
				</Box>

				{/* Description */}
				{room.description && (
					<Box sx={{ mb: 1.5 }}>
						<Typography variant="subtitle2" fontWeight={600} gutterBottom>
							Description
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line", lineHeight: 1.6, fontSize: "0.9rem" }}>
							{room.description}
						</Typography>
					</Box>
				)}

				<Divider sx={{ my: 1.5 }} />

				{/* Room details */}
				<Box sx={{ mb: 1.5 }}>
					<Typography variant="subtitle2" fontWeight={600} gutterBottom>
						Room details
					</Typography>

					<Stack spacing={1.2}>
						<Stack direction="row" spacing={1} alignItems="center">
							<Person fontSize="small" color="primary" />
							<Box>
								<Typography variant="body2" fontWeight={600}>
									{room.maxAdults} {room.maxAdults === 1 ? "Adult" : "Adults"}
								</Typography>
								{room.maxChildren > 0 && (
									<Typography variant="caption" color="text.secondary">
										+{room.maxChildren} {room.maxChildren === 1 ? "child" : "children"}
									</Typography>
								)}
							</Box>
						</Stack>

						<Stack direction="row" spacing={1} alignItems="center">
							<Hotel fontSize="small" color="primary" />
							<Box>
								<Typography variant="body2" fontWeight={600}>
									{room.beds.length} {room.beds.length === 1 ? "Bed" : "Beds"}
								</Typography>
								{room.beds.length > 0 && (
									<Typography variant="caption" color="text.secondary">
										{room.beds.map((b) => b.bedType).join(", ")}
									</Typography>
								)}
							</Box>
						</Stack>

						<Stack direction="row" spacing={1} alignItems="center">
							<SquareFoot fontSize="small" color="primary" />
							<Box>
								<Typography variant="body2" fontWeight={600}>
									{room.size} m²
								</Typography>
								<Typography variant="caption" color="text.secondary">
									Room size
								</Typography>
							</Box>
						</Stack>

						<Stack direction="row" spacing={1} alignItems="center">
							<Bathtub fontSize="small" color="primary" />
							<Box>
								<Typography variant="body2" fontWeight={600}>
									{room.bathroomCount} {room.bathroomCount === 1 ? "Bathroom" : "Bathrooms"}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									Private bathroom
								</Typography>
							</Box>
						</Stack>

						{room.viewType && (
							<Stack direction="row" spacing={1} alignItems="center">
								<Visibility fontSize="small" color="primary" />
								<Box>
									<Typography variant="body2" fontWeight={600}>
										{getViewTypeLabel(room.viewType)}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										View
									</Typography>
								</Box>
							</Stack>
						)}
					</Stack>
				</Box>

				{/* Amenities */}
				{room.amenities.length > 0 && (
					<Box>
						<Typography variant="subtitle2" fontWeight={600} gutterBottom>
							Amenities
						</Typography>
						<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
							{room.amenities.map((a) => (
								<Chip
									key={a.id}
									label={a.name}
									size="small"
									variant="outlined"
									sx={{
										height: 26,
										fontSize: "0.75rem",
										borderColor: "grey.300",
									}}
								/>
							))}
						</Box>
					</Box>
				)}
			</DialogContent>

			<DialogActions sx={{ px: 2, py: 1.5 }}>
				<Button onClick={closeModal} color="inherit">
					Close
				</Button>
			</DialogActions>
		</>
	);
};

export default RoomDetailModal;
