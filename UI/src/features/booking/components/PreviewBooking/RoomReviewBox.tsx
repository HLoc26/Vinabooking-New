import { Box, Card, CardContent, Typography, Divider } from "@mui/material";
import { type Dispatch, type SetStateAction } from "react";
import RoomReviewCard from "./RoomReviewCard"; // Corrected path
import type { RoomFullDetail } from "../../../accommodation/types/room.types";

type BookingRoom = RoomFullDetail & {
	count: number;
};
type RoomReviewBoxProps = {
	roomsInfo: BookingRoom[];
	nights?: number;
	// FIX: Standardized to string array setter
	setGalleryImages: Dispatch<SetStateAction<string[]>>;
	openImageGallery: (index: number) => void;
};

const RoomReviewBox: React.FC<RoomReviewBoxProps> = ({ roomsInfo, nights, setGalleryImages, openImageGallery }) => {
	return (
		<Card sx={{ borderRadius: 2 }}>
			<CardContent>
				<Typography variant="h6" mb={2} fontWeight="bold">
					Room Review
				</Typography>
				<Divider sx={{ mb: 2 }} />

				{roomsInfo.map((room, idx) => {
					// Logic: Get thumbnail URL from variants
					const thumbnail = room.images?.flatMap((img) => img.variants).find((v) => v.variant === "THUMBNAIL")?.url || "";

					// Logic: Pass all Image objects to the card
					// The card will handle mapping these to strings when clicked
					const roomImages = room.images || [];

					return (
						<Box key={room.id} mb={idx < roomsInfo.length - 1 ? 3 : 0}>
							<RoomReviewCard room={room} thumbnail={thumbnail} images={roomImages} nights={nights} setGalleryImages={setGalleryImages} openImageGallery={openImageGallery} amenities={room.amenities} />
						</Box>
					);
				})}
			</CardContent>
		</Card>
	);
};

export default RoomReviewBox;
