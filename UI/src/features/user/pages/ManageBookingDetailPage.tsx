import { useParams, useNavigate } from "react-router-dom";
import useUserBookingDetail from "../../booking/hooks/useUserBookingDetail";
import { useState, useEffect } from "react";

import { Box, Card, CardContent, Typography, Button, Divider, CircularProgress, Chip, Stack, Paper, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { EventAvailable, ConfirmationNumber, Cancel, CheckCircle, Pending, Block, ArrowBack, Close, Payment, ReceiptLong } from "@mui/icons-material";

import BookingDetailItem from "../components/tabs/BookingsTab/BookingDetailItem";
import { bookingApi } from "../../booking/services/bookingApi";
import { usePayOS } from "@payos/payos-checkout";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";
import type { Booking, PaymentTransfer } from "../../booking/types/Booking";

const ManageBookingDetailPage = () => {
	const { bookingId } = useParams<{ bookingId: string }>();
	const navigate = useNavigate();
	const { booking, loading, initialized } = useUserBookingDetail(bookingId ?? "");
	const { pushNotification } = usePushNotificationContext();

	const [loadingCancel, setLoadingCancel] = useState(false);
	const [isCreatingLink, setIsCreatingLink] = useState(false);
	const [isPaymentOpen, setIsPaymentOpen] = useState(false);
	const [checkoutUrl, setCheckoutUrl] = useState("");

	const returnUrl = `${window.location.origin}/booking/payment-success`;
	const cancelUrl = `${window.location.origin}/user/manage-booking/${bookingId}?failed=true`;

	const { open, exit } = usePayOS({
		RETURN_URL: returnUrl,
		ELEMENT_ID: "payos-embedded-container",
		CHECKOUT_URL: checkoutUrl,
		embedded: true,
		onSuccess: () => {
			setIsPaymentOpen(false);
			pushNotification("Payment successful! Booking confirmed.", "success");
			window.location.reload();
		},
		onExit: () => {
			setIsPaymentOpen(false);
		},
		onCancel: () => {
			setIsPaymentOpen(false);
		},
	});

	useEffect(() => {
		if (isPaymentOpen && checkoutUrl) {
			const timer = setTimeout(() => {
				open();
			}, 50);
			return () => clearTimeout(timer);
		}
	}, [isPaymentOpen, checkoutUrl, open]);

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

	const handlePayNow = async () => {
		if (!bookingId) return;
		try {
			setIsCreatingLink(true);
			const paymentRes = await bookingApi.createPaymentLink(bookingId, returnUrl, cancelUrl);
			if (!paymentRes.success || !paymentRes.data?.checkoutUrl) {
				throw new Error(paymentRes.error || "Failed to create payment link");
			}
			setCheckoutUrl(paymentRes.data.checkoutUrl);
			setIsPaymentOpen(true);
		} catch (err) {
			console.error(err);
			pushNotification("Failed to initiate payment. Please try again.", "error");
		} finally {
			setIsCreatingLink(false);
		}
	};

	const formatDate = (dateStr: string | null) => {
		if (!dateStr) return "—";
		return new Date(dateStr).toLocaleString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatAmount = (amount: string, currency: string) => `${Number(amount).toLocaleString("vi-VN")} ${currency}`;

	const getStatusConfig = (status: string) => {
		switch (status) {
			case "BOOKED":
				return { color: "success" as const, icon: <CheckCircle sx={{ fontSize: 18 }} />, label: "Booked" };
			case "PENDING":
				return { color: "warning" as const, icon: <Pending sx={{ fontSize: 18 }} />, label: "Pending" };
			case "CANCELLED":
				return { color: "error" as const, icon: <Cancel sx={{ fontSize: 18 }} />, label: "Cancelled" };
			default:
				return { color: "default" as const, icon: <Block sx={{ fontSize: 18 }} />, label: status };
		}
	};

	const getPaymentStatusConfig = (b: Booking) => {
		if (b.status === "CANCELLED") return { color: "error" as const, label: "N/A" };
		const isPaid = b.PaymentTransfer?.some((p: PaymentTransfer) => p.status === "COMPLETED");
		if (isPaid) return { color: "success" as const, label: "Payment completed" };
		return { color: "warning" as const, label: "Not yet paid" };
	};

	if (loading || !initialized) {
		return (
			<Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
				<CircularProgress />
			</Box>
		);
	}

	if (!booking) {
		return (
			<Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
				<Paper elevation={3} sx={{ p: 6, textAlign: "center", borderRadius: 3, maxWidth: 400 }}>
					<Cancel sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
					<Typography variant="h5" fontWeight={600} gutterBottom>
						Booking Not Found
					</Typography>
					<Typography color="text.secondary" sx={{ mb: 3 }}>
						The booking you're looking for doesn't exist or has been removed.
					</Typography>
					<Button startIcon={<ArrowBack />} onClick={() => navigate("/user/me/my-bookings")}>
						Back to My Bookings
					</Button>
				</Paper>
			</Box>
		);
	}

	const statusConfig = getStatusConfig(booking.status);
	const paymentStatusConfig = getPaymentStatusConfig(booking);
	const isPaid = booking.PaymentTransfer?.some((p: PaymentTransfer) => p.status === "COMPLETED");
	const completedPayment = booking.PaymentTransfer?.find((p: PaymentTransfer) => p.status === "COMPLETED");

	return (
		<Box sx={{ minHeight: "100vh", py: 6, pt: 2, px: 2 }}>
			<Box sx={{ maxWidth: 720, mx: "auto" }}>
				{/* Back Button */}
				<Button startIcon={<ArrowBack />} onClick={() => navigate("/user/me/my-bookings")} sx={{ mb: 2, textTransform: "none", fontWeight: 600, color: "text.secondary" }}>
					Back to My Bookings
				</Button>

				{/* Header */}
				<Paper elevation={1} sx={{ p: 3, mb: 3, background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)", borderRadius: 3 }}>
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
					<BookingDetailItem booking={booking} hideManageButton={true} />
				</Box>

				{/* Management Card */}
				<Card elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
					<Box sx={{ p: 3, pb: 0 }}>
						<Typography variant="h5" fontWeight={700}>
							Manage Booking
						</Typography>
					</Box>

					<CardContent sx={{ p: 3, pt: 1 }}>
						<Stack spacing={3}>
							{/* Status Section */}
							<Stack direction="row" spacing={4}>
								<Box>
									<Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
										Booking Status
									</Typography>
									<Chip icon={statusConfig.icon} label={statusConfig.label} color={statusConfig.color} sx={{ fontWeight: 600, px: 1, height: 36 }} />
								</Box>
								<Box>
									<Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
										Payment Status
									</Typography>
									<Chip label={paymentStatusConfig.label} color={paymentStatusConfig.color} sx={{ fontWeight: 600, px: 1, height: 36 }} />
								</Box>
							</Stack>

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

							{/* Payment Details — only shown when payment is completed */}
							{completedPayment && (
								<>
									<Divider />
									<Box>
										<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
											<ReceiptLong sx={{ color: "success.main", fontSize: 20 }} />
											<Typography variant="caption" color="text.secondary" sx={{ display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
												Payment Details
											</Typography>
										</Stack>
										<Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", borderColor: "success.light" }}>
											<Stack divider={<Divider />}>
												<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5 }}>
													<Typography variant="body2" color="text.secondary">
														Amount Paid
													</Typography>
													<Typography variant="body2" fontWeight={700} color="success.main">
														{formatAmount(completedPayment.amount, completedPayment.currency)}
													</Typography>
												</Stack>
												<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5 }}>
													<Typography variant="body2" color="text.secondary">
														Date Paid
													</Typography>
													<Typography variant="body2" fontWeight={600}>
														{formatDate(completedPayment.completedAt ?? completedPayment.createdAt)}
													</Typography>
												</Stack>
												{completedPayment.transferReference && (
													<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5 }}>
														<Typography variant="body2" color="text.secondary">
															Transfer Reference
														</Typography>
														<Typography variant="body2" fontWeight={600} sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
															{completedPayment.transferReference}
														</Typography>
													</Stack>
												)}
												<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5 }}>
													<Typography variant="body2" color="text.secondary">
														Content
													</Typography>
													<Typography variant="body2" fontWeight={600}>
														{completedPayment.transferContent}
													</Typography>
												</Stack>
											</Stack>
										</Paper>
									</Box>
								</>
							)}

							{/* Actions */}
							{["PENDING", "BOOKED"].includes(booking.status) && (
								<>
									<Divider />
									<Stack spacing={2}>
										{booking.status === "PENDING" && !isPaid && (
											<Box>
												<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
													Your booking is not paid yet. Please complete the payment to secure your reservation.
												</Typography>
												<Button
													variant="contained"
													color="primary"
													size="large"
													fullWidth
													disabled={isCreatingLink}
													onClick={handlePayNow}
													startIcon={isCreatingLink ? null : <Payment />}
													sx={{ py: 1.5, fontWeight: 600, borderRadius: 2, textTransform: "none", fontSize: "1rem" }}
												>
													{isCreatingLink ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Pay for this booking now"}
												</Button>
											</Box>
										)}
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
												sx={{ py: 1.5, fontWeight: 600, borderRadius: 2, textTransform: "none", fontSize: "1rem" }}
											>
												{loadingCancel ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Cancel Booking"}
											</Button>
										</Box>
									</Stack>
								</>
							)}
						</Stack>
					</CardContent>
				</Card>
			</Box>

			{/* Payment Dialog */}
			<Dialog open={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
				<DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
					<Typography variant="h6" fontWeight={700} component="span">
						Complete Your Payment
					</Typography>
					<IconButton
						onClick={() => {
							exit();
							setIsPaymentOpen(false);
						}}
					>
						<Close />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers sx={{ p: 0, backgroundColor: "#fafafa", height: 600 }}>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							height: "100%",
							width: "100%",
							"& iframe": {
								width: "100% !important",
								height: "100% !important",
								border: "none",
								display: "block",
								transform: "scale(1.2)",
								transformOrigin: "top center",
							},
						}}
					>
						<div id="payos-embedded-container" style={{ width: "100%", height: "100%" }} />
					</Box>
				</DialogContent>
			</Dialog>
		</Box>
	);
};

export default ManageBookingDetailPage;
