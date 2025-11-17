// RoomReviewCard.tsx
import { Box, Typography } from "@mui/material";
import type { ImageType } from "../services/types/Image";

type Props = {
	roomName: string;
	roomType: string;
	roomPrice: number;
	thumbnail?: string;
	images: ImageType[];
	loading: boolean;
	setGalleryImages: (imgs: ImageType[]) => void;
	openImageGallery: (index: number) => void;
};

const RoomReviewCard: React.FC<Props> = ({ roomName, roomType, roomPrice, thumbnail, images, loading, setGalleryImages, openImageGallery }) => {
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
						<Typography variant="body2" color="text.secondary">
							Type of place: {roomType.toLowerCase()}
						</Typography>
					</Box>

					<Typography variant="h6" sx={{ color: "warning.main" }} textAlign="right">
						${roomPrice}
					</Typography>
				</Box>
			</Box>
		</Box>
	);
};

export default RoomReviewCard;
