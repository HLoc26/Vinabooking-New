import React from "react";
import { Card, CardContent, CardMedia, Typography, Link, Stack, Box, Button, Chip, Divider, Skeleton, Avatar, Rating } from "@mui/material";
import { CalendarMonthOutlined, MapOutlined, PersonOutline, ArrowForward } from "@mui/icons-material";
import type { Booking } from "../../../types/Booking";
import useAccommodationByRoom from "../../../hooks/useAccommodationByRoom";
import useRoomInfo from "../../../hooks/useRoomInfo";
import { formatDate } from "../../../../../utils/dateFormatter";
import { Link as RouterLink } from "react-router-dom";
import useModalContext from "../../../../../context/ModalContext/hook";
import ReviewModal from "../../../../../components/shared/ReviewModal";
import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";
import { useAccommodationReview } from "../../../../accommodation/hooks/useAccommodationReview";
import { type ReviewData } from "../../../../../types/Review";
import { authStorage } from "../../../../../features/auth/utils/authStorage";

type BookingDetailItemProps = {
	booking: Booking;
	image: string;
	hideManageButton?: boolean;
};

const StatusBadge: React.FC<{ status: Booking["status"] }> = ({ status }) => {
	let color: "success" | "primary" | "error" | "default" | "warning" = "default";
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
	} else if (status === "PENDING") {
		color = "warning";
		label = "Pending";
	}

	return <Chip label={label} color={color} size="small" sx={{ position: "absolute", top: 6, left: 6, fontWeight: 600 }} />;
};

const BookingReview: React.FC<{ review: ReviewData }> = ({ review }) => {
	return (
		<Box mt={2}>
			<Divider />
			<Box mt={2}>
				<Typography variant="subtitle1" fontWeight={600} mb={1}>
					Your Review
				</Typography>
				<Stack direction="row" spacing={1} alignItems="center">
					<Avatar sx={{ bgcolor: "primary.main", width: 24, height: 24, fontSize: 14 }}>{review.user.name?.charAt(0).toUpperCase() || "U"}</Avatar>
					<Typography variant="body1" fontWeight={600}>
						{review.user.name}
					</Typography>
					<Rating value={review.star} readOnly size="small" />
					<Typography variant="body2" color="text.secondary" noWrap>
						{review.comment}
					</Typography>
				</Stack>
			</Box>
		</Box>
	);
};

const BookingDetailItem: React.FC<BookingDetailItemProps> = ({ booking, image, hideManageButton }) => {
	const { startDate, endDate, guestCount, status, referenceNo } = booking;

	const roomId = booking.details?.[0]?.itemId || null;

	const accommodation = useAccommodationByRoom(roomId ?? "");
	const room = useRoomInfo(roomId ?? "");
	const roomName = room?.name ?? "";
	const accommodationName = accommodation?.name ?? "";
	const fullAddress = accommodation?.address?.fullAddress ?? "";

	const { reviews, loading: reviewsLoading, refresh: refreshReviews } = useAccommodationReview(accommodation?.id || "");

	const user = authStorage.getUserSync();

	const userReview = reviews.find((review) => review.bookingId === booking.id && review.user.id === user?.id);

	const images = accommodation?.images;

	const thumbnails = images?.filter((i) => i.variant == "THUMBNAIL");

	const { openModal } = useModalContext();
	const { pushNotification } = usePushNotificationContext();

	const handleOpenReview = () => {
		openModal(
			<ReviewModal //
				accommodationId={accommodation?.id || ""}
				bookingId={booking.id}
				booking={booking}
				onSuccess={() => {
					pushNotification("Create review successfully", "success");
					refreshReviews();
				}}
			/>
		);
	};

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
			<Box sx={{ position: "relative", minWidth: 200, width: 200, height: "auto" }}>
				{accommodation ? (
					<>
						<CardMedia component="img" image={thumbnails?.[0]?.url ?? image} alt={accommodationName || "Accommodation"} sx={{ width: "200px", height: "100%", objectFit: "cover" }} />
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
						<Link
							component={RouterLink}
							to={`/accommodation/${accommodation?.id}`}
							underline="none"
							sx={{
								"&:hover": {
									color: "primary.main",
									textDecoration: "underline",
									cursor: "pointer",
								},
							}}
						>
							<Typography variant="h6" fontWeight={700} noWrap mb={1}>
								{accommodationName}
							</Typography>
						</Link>
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
									{formatDate(startDate instanceof Date ? startDate.toString() : startDate)}
								</Typography>
							</Stack>

							<ArrowForward fontSize="small" sx={{ fontSize: 16 }} />

							<Typography variant="body2" fontSize={15}>
								{formatDate(endDate instanceof Date ? endDate.toString() : endDate)}
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
							{status === "COMPLETED" && !userReview && (
								<Button variant="contained" color="success" size="small" sx={{ fontSize: 13 }} onClick={handleOpenReview} disabled={reviewsLoading}>
									Write a Review
								</Button>
							)}

							{!hideManageButton && (status === "BOOKED" || status === "PENDING") && (
								<Button //
									component={RouterLink}
									to={`/user/manage-booking/${booking.id}`}
									variant="contained"
									color="primary"
									size="small"
									sx={{ fontSize: 13, py: 0.5, px: 2 }}
								>
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
				{userReview && <BookingReview review={userReview} />}
			</CardContent>
		</Card>
	);
};

export default BookingDetailItem;
