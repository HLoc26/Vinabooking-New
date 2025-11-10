import React from "react";
import { Box, Typography, List, ListItem } from "@mui/material";
import type { BookingDto } from "../services/types/BookingDto";

interface Props {
	booking: BookingDto;
}

export const AccommodationInfoBox: React.FC<Props> = ({ booking }) => {
	return (
		<Box p={2} borderRadius={2} boxShadow={2} mb={3}>
			<Typography variant="h6" gutterBottom>
				Accommodation Information
			</Typography>
			<Typography>
				<b>Name:</b> {booking.accommodation.name}
			</Typography>
			<Typography>
				<b>Address:</b> {booking.accommodation.address}
			</Typography>
			<Typography>
				<b>Guests:</b> {booking.guestCount}
			</Typography>
			<Typography sx={{ mt: 2 }}>
				<b>Rooms / Beds:</b>
			</Typography>
			<List>
				{booking.rooms.map((r) => (
					<ListItem key={r.id}>
						{r.type === "ROOM" ? "🏠" : "🛏️"} {r.name}
					</ListItem>
				))}
			</List>
		</Box>
	);
};
