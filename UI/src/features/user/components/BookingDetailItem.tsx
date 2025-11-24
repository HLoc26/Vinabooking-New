import React from "react";
import { Card, CardContent, CardMedia, Typography, Stack, Box, Button, Chip, Divider, Skeleton } from "@mui/material";
import { CalendarMonthOutlined, MapOutlined, PersonOutline, ArrowForward } from "@mui/icons-material";
import type { Booking } from "../types/Booking";
import useAccommodationByRoom from "../hooks/useAccommodationByRoom";
import useRoomInfo from "../hooks/useRoomInfo";

type BookingDetailItemProps = {
	booking: Booking;
	image: string;
};

const StatusBadge: React.FC<{ status: Booking["status"] }> = ({ status }) => {
	let color: "success" | "primary" | "error" | "default" = "default";
	let label: string = status;

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

	return <Chip label={label} color={color} size="small" sx={{ position: "absolute", top: 6, left: 6, fontWeight: 400 }} />;
};

const BookingDetailItem: React.FC<BookingDetailItemProps> = ({ booking, image }) => {
	const { startDate, endDate, guestCount, status, referenceNo } = booking;

	const roomId = booking.details?.[0]?.itemId || null;

	const accommodation = useAccommodationByRoom(roomId ?? "");
	const room = useRoomInfo(roomId ?? "");
	const roomName = room?.name ?? "";
	const accommodationName = accommodation?.name ?? "";
	const fullAddress = accommodation?.address?.fullAddress ?? "";

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
			{/* Image */}
			<Box sx={{ position: "relative", minWidth: 200, width: 200, height: 210 }}>
				{accommodation ? (
					<>
						<CardMedia component="img" image={image} alt={accommodationName || "Accommodation"} sx={{ width: "200px", height: "100%", objectFit: "cover" }} />
						<StatusBadge status={status} />
					</>
				) : (
					<Skeleton variant="rectangular" width="200px" height="100%" sx={{ borderRadius: 1 }} />
				)}
			</Box>

			{/* Content */}
			<CardContent
				sx={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					px: 2,
					py: 2,
				}}
			>
				<Box>
					{/* Name */}
					{accommodationName ? (
						<Typography variant="h6" fontWeight={700} noWrap mb={1}>
							{accommodationName}
						</Typography>
					) : (
						<Skeleton variant="text" sx={{ fontSize: 24, fontWeight: 700, width: 200 }} />
					)}

					{/* Address */}
					{fullAddress ? (
						<Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
							<MapOutlined fontSize="small" sx={{ fontSize: 16 }} />
							<Typography variant="body2" fontSize={15}>
								{fullAddress}
							</Typography>
						</Stack>
					) : (
						<Skeleton variant="text" sx={{ fontSize: 15, width: 400 }} />
					)}

					{/* Dates */}
					{accommodation ? (
						<Stack direction="row" spacing={2} mt={1} alignItems="center">
							<Stack direction="row" spacing={0.5} alignItems="center">
								<CalendarMonthOutlined fontSize="small" sx={{ fontSize: 16 }} />
								<Typography variant="body2" fontSize={15}>
									{startDate.toLocaleDateString()}
								</Typography>
							</Stack>

							<ArrowForward fontSize="small" sx={{ fontSize: 16 }} />

							<Typography variant="body2" fontSize={15}>
								{endDate.toLocaleDateString()}
							</Typography>
						</Stack>
					) : (
						<Skeleton variant="text" sx={{ fontSize: 15, width: 150 }} />
					)}

					{/* Guests */}
					{accommodation ? (
						<Stack direction="row" spacing={1} alignItems="center" mt={1} color="text.secondary">
							<PersonOutline fontSize="small" sx={{ fontSize: 16 }} />
							<Typography variant="body2" fontSize={15}>
								{guestCount} Guest(s) • {roomName}
							</Typography>
						</Stack>
					) : (
						<Skeleton variant="text" sx={{ fontSize: 15, width: 300 }} />
					)}
				</Box>

				<Divider sx={{ my: 1 }} />

				{/* Footer */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						pb: 0,
					}}
				>
					{accommodation ? (
						<Typography variant="body2" color="text.secondary" textAlign={"center"}>
							Ref. No: {referenceNo || "-"}
						</Typography>
					) : (
						<Skeleton variant="text" sx={{ fontSize: 12, width: 100 }} />
					)}

					{accommodation ? (
						<>
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
						</>
					) : (
						<></>
					)}
				</Box>
			</CardContent>
		</Card>
	);
};

export default BookingDetailItem;
