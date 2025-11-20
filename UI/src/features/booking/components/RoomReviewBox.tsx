import { Box, Card, CardContent, Typography } from "@mui/material";
import { useMemo, type Dispatch, type SetStateAction } from "react";
import type { ImageType } from "../../../types/Image";
import { useFetchRoomsImages } from "../hooks/useFetchRoomImages";
import RoomReviewCard from "./RoomReviewCard";
import type { RoomInfo } from "../services/types/RoomInfo";

type RoomReviewCardProps = {
	roomsInfo: RoomInfo[];
	setGalleryImages: Dispatch<SetStateAction<ImageType[]>>;
	openImageGallery: (index: number) => void;
};

const RoomReviewBox: React.FC<RoomReviewCardProps> = ({ roomsInfo, setGalleryImages, openImageGallery }) => {
	const roomIds = useMemo(() => roomsInfo.map((r) => r.id), [roomsInfo]);

	const { roomImagesMap, loading } = useFetchRoomsImages(roomIds);

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

				{roomsInfo.map((room, idx) => (
					<Box key={room.id} mb={idx < roomsInfo.length - 1 ? 3 : 0}>
						<RoomReviewCard
							roomName={room.name}
							roomPrice={room.price || "0"}
							thumbnail={roomThumbnail[room.id]}
							images={roomImagesByRoomId[room.id] || []}
							loading={loading}
							setGalleryImages={setGalleryImages}
							openImageGallery={openImageGallery}
							amenities={room.amenities}
						/>
					</Box>
				))}
			</CardContent>
		</Card>
	);
};

export default RoomReviewBox;
