import { Box, Card, CardContent, Typography } from "@mui/material";
import type { BookingDto } from "../services/types/BookingDto";
import type { Dispatch, SetStateAction } from "react";
import type { ImageType } from "../services/types/Image";
import { useFetchRoomsImages } from "../hooks/useFetchRoomImages";
import RoomReviewCard from "./RoomReviewCard";

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
						<RoomReviewCard
							roomName={room.name}
							roomType={room.type}
							roomPrice={room.price || 0}
							thumbnail={roomThumbnail[room.id]}
							images={roomImagesByRoomId[room.id] || []}
							loading={loading}
							setGalleryImages={setGalleryImages}
							openImageGallery={openImageGallery}
						/>
					</Box>
				))}
			</CardContent>
		</Card>
	);
};

export default RoomReviewBox;
