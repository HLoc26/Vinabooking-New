import { useParams } from "react-router-dom";
import useUserBookingDetail from "../hooks/useUserBookingDetail";
import bookingApi from "../services/bookingApi";
import { useState } from "react";

import { Box, Card, CardContent, Typography, Button, Divider, CircularProgress, Chip, Stack, Paper } from "@mui/material";
import { EventAvailable, ConfirmationNumber, Cancel, CheckCircle, Pending, Block } from "@mui/icons-material";

import BookingDetailItem from "../components/tabs/BookingsTab/BookingDetailItem";

const ManageBookingDetailPage = () => {
	const { bookingId } = useParams<{ bookingId: string }>();
	const { booking, loading, initialized } = useUserBookingDetail(bookingId ?? "");

	const [loadingCancel, setLoadingCancel] = useState(false);

	async function handleCancel() {
		if (!bookingId) return;
		setLoadingCancel(true);

		try {
			await bookingApi.cancel(bookingId);
		} catch (e) {
			console.log(e);
		} finally {
			setLoadingCancel(false);
			window.location.reload();
		}
	}

	const getStatusConfig = (status: string) => {
		switch (status) {
			case "BOOKED":
				return {
					color: "success" as const,
					icon: <CheckCircle sx={{ fontSize: 18 }} />,
					label: "Booked",
				};
			case "PENDING":
				return {
					color: "warning" as const,
					icon: <Pending sx={{ fontSize: 18 }} />,
					label: "Pending",
				};
			case "CANCELLED":
				return {
					color: "error" as const,
					icon: <Cancel sx={{ fontSize: 18 }} />,
					label: "Cancelled",
				};
			default:
				return {
					color: "default" as const,
					icon: <Block sx={{ fontSize: 18 }} />,
					label: status,
				};
		}
	};

	if (loading || !initialized) {
		return (
			<Box
				sx={{
					minHeight: "60vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (!booking) {
		return (
			<Box
				sx={{
					minHeight: "60vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Paper
					elevation={3}
					sx={{
						p: 6,
						textAlign: "center",
						borderRadius: 3,
						maxWidth: 400,
					}}
				>
					<Cancel sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
					<Typography variant="h5" fontWeight={600} gutterBottom>
						Booking Not Found
					</Typography>
					<Typography color="text.secondary">The booking you're looking for doesn't exist or has been removed.</Typography>
				</Paper>
			</Box>
		);
	}

	const statusConfig = getStatusConfig(booking.status);

	return (
		<Box
			sx={{
				minHeight: "100vh",
				py: 6,
				pt: 2,
				px: 2,
			}}
		>
			<Box sx={{ maxWidth: 720, mx: "auto" }}>
				{/* Header */}
				<Paper
					elevation={1}
					sx={{
						p: 3,
						mb: 3,
						background: "rgba(255, 255, 255, 0.95)",
						backdropFilter: "blur(10px)",
						borderRadius: 3,
					}}
				>
					<Stack direction="row" alignItems="center" spacing={2}>
						<EventAvailable sx={{ fontSize: 40, color: "primary.main" }} />
						<Box flex={1}>
							<Typography variant="h4" fontWeight={700} gutterBottom>
								Booking Details
							</Typography>
							<Typography variant="body2" color="text.secondary">
								View and manage your reservation
							</Typography>
						</Box>
					</Stack>
				</Paper>

				{/* Accommodation Card */}
				<Box sx={{ mb: 3 }}>
					<BookingDetailItem booking={booking} image={"/fallback.png"} />
				</Box>

				{/* Management Card */}
				<Card
					elevation={3}
					sx={{
						borderRadius: 3,
						overflow: "hidden",
					}}
				>
					<Box
						sx={{
							p: 3,
							pb: 0,
						}}
					>
						<Typography variant="h5" fontWeight={700}>
							Manage Booking
						</Typography>
					</Box>

					<CardContent sx={{ p: 3, pt: 1 }}>
						<Stack spacing={3}>
							{/* Status Section */}
							<Box>
								<Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
									Booking Status
								</Typography>
								<Chip
									icon={statusConfig.icon}
									label={statusConfig.label}
									color={statusConfig.color}
									sx={{
										fontWeight: 600,
										px: 1,
										height: 36,
									}}
								/>
							</Box>

							<Divider />

							{/* Reference Number */}
							<Box>
								<Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
									Reference Number
								</Typography>
								<Stack direction="row" alignItems="center" spacing={1}>
									<ConfirmationNumber sx={{ color: "primary.main" }} />
									<Typography variant="h6" fontWeight={600}>
										{booking.referenceNo}
									</Typography>
								</Stack>
							</Box>

							{/* Cancel Action */}
							{["PENDING", "BOOKED"].includes(booking.status) && (
								<>
									<Divider />
									<Box>
										<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
											Need to change your plans? You can cancel your booking below.
										</Typography>
										<Button
											variant="contained"
											color="error"
											size="large"
											fullWidth
											disabled={loadingCancel}
											onClick={handleCancel}
											startIcon={loadingCancel ? null : <Cancel />}
											sx={{
												py: 1.5,
												fontWeight: 600,
												borderRadius: 2,
												textTransform: "none",
												fontSize: "1rem",
											}}
										>
											{loadingCancel ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Cancel Booking"}
										</Button>
									</Box>
								</>
							)}
						</Stack>
					</CardContent>
				</Card>
			</Box>
		</Box>
	);
};

export default ManageBookingDetailPage;
