import React from "react";
import { Card, CardContent, CardMedia, Typography, Stack, Box, Button, Chip, Divider } from "@mui/material";
import { CalendarMonthOutlined, ArrowRight, MapOutlined, PersonOutline } from "@mui/icons-material";
import type { Booking } from "../types/Booking";

type BookingDetailItemProps = {
	booking: Booking;
	image: string;
};

const StatusBadge: React.FC<{ status: Booking["status"] }> = ({ status }) => {
	let color: "success" | "primary" | "error" | "default" = "default";
	let label;

	if (status === "BOOKED") {
		color = "primary";
		label = "Upcoming";
	} else if (status === "COMPLETED") {
		color = "success";
		label = "Completed";
	} else if (status === "CANCELLED") {
		color = "error";
		label = "Canceled";
	}

	return <Chip label={label} color={color} size="small" sx={{ position: "absolute", top: 6, left: 6, fontWeight: 600 }} />;
};

const BookingDetailItem: React.FC<BookingDetailItemProps> = ({ booking, image }) => {
	const { startDate, endDate, guestCount, status, referenceNo } = booking;

	return (
		<Card
			elevation={2}
			sx={{
				display: "flex",
				borderRadius: 2,
				overflow: "hidden",
				position: "relative",
				mb: 2,
				transition: "0.2s",
				"&:hover": { boxShadow: 5 },
				minHeight: 130,
			}}
		>
			{/* Image Section */}
			<Box sx={{ position: "relative", minWidth: 200 }}>
				<CardMedia component="img" image={image} alt="Accommodation" sx={{ width: 200, height: "100%", objectFit: "cover" }} />
				<StatusBadge status={status} />
			</Box>

			{/* Content Section */}
			<CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", px: 2, py: 2 }}>
				<Box>
					{/* Accommodation Name + Ref No + Address */}
					<Typography variant="subtitle1" fontWeight={700} noWrap>
						Accommodation Name (placeholder)
					</Typography>

					<Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
						<MapOutlined fontSize="small" sx={{ fontSize: 16 }} />
						<Typography variant="body2">123 Street, City (placeholder)</Typography>
					</Stack>

					{/* Dates */}
					<Stack direction="row" spacing={2} mt={1} alignItems="center">
						<Stack direction="row" spacing={0.5} alignItems="center">
							<CalendarMonthOutlined fontSize="small" sx={{ fontSize: 16 }} />
							<Typography variant="body2">{startDate.toLocaleDateString()}</Typography>
						</Stack>
						<ArrowRight fontSize="small" sx={{ fontSize: 16 }} />
						<Typography variant="body2">{endDate.toLocaleDateString()}</Typography>
					</Stack>

					{/* Guests & Room Type */}
					<Stack direction="row" spacing={0.5} alignItems="center" mt={1} color="text.secondary">
						<PersonOutline fontSize="small" sx={{ fontSize: 16 }} />
						<Typography variant="body2">{guestCount} Guest(s) • Room Type (placeholder)</Typography>
					</Stack>
				</Box>

				<Divider sx={{ my: 1 }} />

				{/* Action Button */}
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 0 }}>
					<Typography variant="body2" color="text.secondary" textAlign={"center"}>
						Ref. No: {referenceNo || "123456"}
					</Typography>
					{status === "COMPLETED" && (
						<Button variant="contained" color="success" size="small" sx={{ fontSize: 13 }}>
							Write a Review
						</Button>
					)}
					{status === "BOOKED" && (
						<Button variant="contained" color="primary" size="small" sx={{ fontSize: 13, py: 0.5, px: 2 }}>
							Manage Booking
						</Button>
					)}
					{status === "CANCELLED" && (
						<Button variant="contained" color="success" size="small" sx={{ fontSize: 13 }} disabled>
							Cancelled
						</Button>
					)}
				</Box>
			</CardContent>
		</Card>
	);
};

export default BookingDetailItem;
