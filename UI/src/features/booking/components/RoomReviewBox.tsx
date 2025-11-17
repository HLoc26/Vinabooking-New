import { Box, Card, CardContent, Typography } from "@mui/material";
import type { BookingDto } from "../services/types/BookingDto";
import type { Dispatch, SetStateAction } from "react";
import type { ImageType } from "../services/types/Image";
import { useFetchRoomsImages } from "../hooks/useFetchRoomImages";

type RoomReviewCardProps = {
	booking: BookingDto;
	setGalleryImages: Dispatch<SetStateAction<ImageType[]>>;
	openImageGallery: (index: number) => void;
};

const RoomReviewBox: React.FC<RoomReviewCardProps> = ({ booking, setGalleryImages, openImageGallery }) => {
	const { roomImagesMap, loading } = useFetchRoomsImages(booking.room.map((r) => r.id));

	// Lấy thumbnail và webp images map
	const roomThumbnail: Record<string, string> = {};
	const roomImagesByRoomId: Record<string, ImageType[]> = {};

	for (const roomId of Object.keys(roomImagesMap)) {
		const images = roomImagesMap[roomId] || [];
		// Lấy thumbnail
		const thumbnail = images.find((img) => img.variant === "THUMBNAIL");
		if (thumbnail) roomThumbnail[roomId] = thumbnail.url;

		// Lọc chỉ WEBP cho gallery
		roomImagesByRoomId[roomId] = images.filter((img) => img.variant === "WEBP");
	}
	return (
		<Card>
			<CardContent>
				<Typography variant="h6" mb={2}>
					Room Review
				</Typography>

				{booking.room.map((room, idx) => (
					<Box key={room.id} mb={idx < booking.room.length - 1 ? 3 : 0}>
						<Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2 }}>
							<Box display="flex" gap={2}>
								{/* Room Image */}
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
									) : roomImagesByRoomId[room.id]?.length ? (
										<Box
											component="img"
											src={roomThumbnail[room.id] || roomImagesByRoomId[room.id][0].url}
											alt={room.name}
											onClick={() => {
												const thisRoomImages = roomImagesByRoomId[room.id] || [];
												setGalleryImages(thisRoomImages);
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

								{/* Room Details */}
								<Box flex={1} display="flex" flexDirection="column" justifyContent="space-between">
									<Box>
										<Typography variant="subtitle1" fontWeight={600} mb={0.5}>
											{room.name}
										</Typography>
										<Typography variant="body2" color="text.secondary">
											Type of place: {room.type.toLowerCase()}
										</Typography>
									</Box>
									<Typography variant="h6" sx={{ color: "warning.main" }} textAlign="right">
										${room.price || 0}
									</Typography>
								</Box>
							</Box>
						</Box>
					</Box>
				))}
			</CardContent>
		</Card>
	);
};

export default RoomReviewBox;
