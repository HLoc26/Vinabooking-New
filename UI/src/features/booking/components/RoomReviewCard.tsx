import { Box, Typography, Modal, Chip } from "@mui/material";
import { useState } from "react";
import type { ImageType } from "../../../types/Image";
import type { AmenityConfig } from "../services/types/RoomInfo";

type RoomReviewCardProps = {
	roomName: string;
	roomPrice: string;
	thumbnail?: string;
	images: ImageType[];
	loading: boolean;
	setGalleryImages: (imgs: ImageType[]) => void;
	openImageGallery: (index: number) => void;
	amenities: AmenityConfig[];
};

const RoomReviewCard: React.FC<RoomReviewCardProps> = ({ roomName, roomPrice, thumbnail, images, loading, setGalleryImages, openImageGallery, amenities }) => {
	const [open, setOpen] = useState(false);

	const flatAmenities = amenities.map((c) => c.amenity);
	const preview = flatAmenities.slice(0, 3);
	const remaining = flatAmenities.length - preview.length;

	const grouped = flatAmenities.reduce<Record<string, typeof flatAmenities>>((acc, item) => {
		if (!acc[item.type]) acc[item.type] = [];
		acc[item.type].push(item);
		return acc;
	}, {});

	return (
		<Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2 }}>
			<Box display="flex" gap={2}>
				{/* Image */}
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
					}}
				>
					{loading ? (
						<Typography variant="caption" color="text.secondary">
							Loading...
						</Typography>
					) : images.length ? (
						<Box
							component="img"
							src={thumbnail || images[0].url}
							alt={roomName}
							onClick={() => {
								setGalleryImages(images);
								setTimeout(() => openImageGallery(0), 0);
							}}
							sx={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
								cursor: "pointer",
							}}
						/>
					) : (
						<Typography variant="caption" color="text.secondary">
							No Image
						</Typography>
					)}
				</Box>

				{/* Details */}
				<Box flex={1} display="flex" flexDirection="column" justifyContent="space-between">
					<Box>
						<Typography variant="subtitle1" fontWeight={600} mb={0.5}>
							{roomName}
						</Typography>

						{/* Amenities preview */}
						<Box display="flex" gap={1} flexWrap="wrap" mt={1}>
							{preview.map((a) => (
								<Chip key={a.id} label={a.name} size="small" />
							))}

							{remaining > 0 && <Chip label={`+${remaining}`} size="small" onClick={() => setOpen(true)} sx={{ cursor: "pointer" }} />}
						</Box>
					</Box>

					<Typography variant="h6" sx={{ color: "text.primary", mt: 1, mb: 0 }} textAlign="right">
						$
						{Number.parseInt(roomPrice).toLocaleString("en-US", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}
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
						p: 3,
						borderRadius: 2,
						width: 400,
						maxHeight: "70vh",
						overflowY: "auto",
						boxShadow: 24,
					}}
				>
					<Typography variant="h6" mb={2}>
						Amenities
					</Typography>

					{Object.entries(grouped).map(([type, items]) => (
						<Box key={type} mb={2}>
							<Typography variant="subtitle2" fontWeight={600} mb={1}>
								{type}
							</Typography>

							<Box display="flex" gap={1} flexWrap="wrap">
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
