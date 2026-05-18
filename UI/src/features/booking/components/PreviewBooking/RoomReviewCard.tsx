import { Box, Typography, Modal, Chip } from "@mui/material";
import React, { useState, type Dispatch, type SetStateAction } from "react";
import type { Image } from "../../../../types/Image";
import type { RoomFullDetail } from "../../../accommodation/types/room.types";
import { useCurrency } from "../../../../hooks/useCurrency";

type RoomReviewCardProps = {
	room: RoomFullDetail & { count: number };
	thumbnail: string;
	images: Image[];
	loading?: boolean; // Added missing prop
	setGalleryImages: Dispatch<SetStateAction<string[]>>;
	openImageGallery: (index: number) => void;
	amenities: RoomFullDetail["amenities"]; // Updated to match the actual structure
};

const RoomReviewCard: React.FC<RoomReviewCardProps> = ({ room, thumbnail, images, loading, setGalleryImages, openImageGallery, amenities }) => {
	const [open, setOpen] = useState(false);
	const { format } = useCurrency();

	// Flat mapping logic remains consistent with the new Amenity interface
	const flatAmenities = (amenities || [])
		.map((item: any) => {
			// This reaches into the join table record to get the actual amenity
			return item.amenity;
		})
		.filter(Boolean); // Removes any nulls just in case
	const preview = flatAmenities.slice(0, 3);
	const remaining = flatAmenities.length - preview.length;

	const grouped = flatAmenities.reduce<Record<string, typeof flatAmenities>>((acc, item) => {
		if (!acc[item.type]) acc[item.type] = [];
		acc[item.type].push(item);
		return acc;
	}, {});

	// REUSABLE CLICK HANDLER
	const handlePhotoClick = (index: number) => {
		// Map Image objects to their URL strings (preferring WEBP)
		const imageUrls = images.map((img) => {
			const webpVariant = img.variants?.find((v) => v.variant === "WEBP");
			return webpVariant ? webpVariant.url : img.url;
		});

		setGalleryImages(imageUrls);
		// Use a timeout to ensure state is committed before opening the modal
		setTimeout(() => openImageGallery(index), 0);
	};

	return (
		<Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2, bgcolor: "background.paper" }}>
			<Box display="flex" gap={2}>
				{/* Image Section */}
				<Box
					sx={{
						width: 120,
						height: 120,
						borderRadius: 2,
						flexShrink: 0,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						overflow: "hidden",
						bgcolor: "#f5f5f5",
					}}
				>
					{loading ? (
						<Typography variant="caption" color="text.secondary">
							Loading...
						</Typography>
					) : images.length ? (
						<Box
							component="img"
							// If thumbnail is empty string, fallback to first image URL
							src={thumbnail || images[0].url}
							alt={room.name}
							onClick={() => handlePhotoClick(0)} // FIX: Use the handler
							sx={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
								cursor: "pointer",
								transition: "0.2s",
								"&:hover": { opacity: 0.9 },
							}}
						/>
					) : (
						<Typography variant="caption" color="text.secondary">
							No Image
						</Typography>
					)}
				</Box>

				{/* Details Section */}
				<Box flex={1} display="flex" flexDirection="column" justifyContent="space-between">
					<Box>
						<Typography variant="subtitle1" fontWeight={600} mb={0.5}>
							{room.name} (x{room.count})
						</Typography>

						<Box display="flex" gap={1} flexWrap="wrap" mt={1}>
							{preview.map((a) => (
								<Chip key={a.id} label={a.name} size="small" variant="outlined" />
							))}
							{remaining > 0 && <Chip label={`+${remaining}`} size="small" onClick={() => setOpen(true)} sx={{ cursor: "pointer" }} />}
						</Box>
					</Box>

					<Typography variant="h6" fontWeight="bold" color="primary.main" textAlign="right">
						{format(Number.parseFloat(room.basePrice ?? room.price ?? "0"))}
					</Typography>
				</Box>
			</Box>

			{/* FULL AMENITIES MODAL */}
			<Modal open={open} onClose={() => setOpen(false)}>
				<Box
					sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						bgcolor: "background.paper",
						p: 4,
						borderRadius: 3,
						width: { xs: "90%", sm: 400 },
						maxHeight: "80vh",
						overflowY: "auto",
						boxShadow: 24,
					}}
				>
					<Typography variant="h6" fontWeight="bold" mb={3}>
						Room Amenities
					</Typography>

					{Object.entries(grouped).map(([type, items]) => (
						<Box key={type} mb={3}>
							<Typography variant="overline" color="text.secondary" fontWeight="bold">
								{type}
							</Typography>
							<Box display="flex" gap={1} flexWrap="wrap" mt={1}>
								{items.map((a) => (
									<Chip key={a.id} label={a.name} size="small" />
								))}
							</Box>
						</Box>
					))}
				</Box>
			</Modal>
		</Box>
	);
};

export default RoomReviewCard;
