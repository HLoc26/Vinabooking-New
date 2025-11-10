import React from "react";
import { Box, Typography } from "@mui/material";
import type { BookingDto } from "../services/types/BookingDto";

interface Props {
	booking: BookingDto;
}

export const BookingDatesBox: React.FC<Props> = ({ booking }) => {
	const formatDate = (date: string) =>
		new Date(date).toLocaleDateString("en-GB", {
			weekday: "short",
			day: "2-digit",
			month: "short",
			year: "numeric",
		});

	return (
		<Box p={2} borderRadius={2} boxShadow={2} mb={3}>
			<Typography variant="h6" gutterBottom>
				Stay Dates
			</Typography>
			<Typography>
				<b>Check out:</b>{" "}
				{new Date(booking.startDate).toLocaleDateString("en-GB", {
					day: "2-digit",
					month: "short",
					year: "numeric",
				})}{" "}
			</Typography>
			<Typography>
				<b>Check out:</b>{" "}
				{new Date(booking.endDate).toLocaleDateString("en-GB", {
					day: "2-digit",
					month: "short",
					year: "numeric",
				})}{" "}
			</Typography>
		</Box>
	);
};
