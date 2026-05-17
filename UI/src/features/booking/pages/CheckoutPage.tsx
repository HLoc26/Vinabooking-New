import { useNavigate, useSearchParams } from "react-router-dom";
import { useConfirmBooking } from "../hooks/useConfirmBooking";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";
import { Box, Typography, Button, Paper, List, ListItem, Divider, Stack, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../../app/store";
import { resetBooking } from "../../../features/booking/bookingSlice";
import { formatDate } from "../../../utils/dateFormatter";
import useRooms from "../../accommodation/hooks/useRooms";
import { useState, useEffect } from "react";
import { usePayOS } from "@payos/payos-checkout";
import { bookingApi } from "../services/bookingApi";

export default function CheckoutPage() {
	const navigate = useNavigate();

	const [searchParams] = useSearchParams();

	const dispatch = useDispatch<AppDispatch>();

	const bookingInfo = useSelector((state: RootState) => state.booking);

	const { confirmBooking, loading: confirming } = useConfirmBooking();

	const { pushNotification } = usePushNotificationContext();

	const roomIds = bookingInfo.items.map((i) => i.id);

	const { data: selectedRooms = [] } = useRooms(roomIds);

	const [isPaymentOpen, setIsPaymentOpen] = useState(false);

	const [isCreatingLink, setIsCreatingLink] = useState(false);

	const [paymentFailed] = useState(searchParams.get("failed") === "true");

	const [checkoutUrl, setCheckoutUrl] = useState("");

	const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

	const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

	const [loadingCancelBooking, setLoadingCancelBooking] = useState(false);

	const returnUrl = `${window.location.origin}/booking/payment-success`;

	const cancelUrl = `${window.location.origin}/booking/checkout?failed=true`;

	const { open, exit } = usePayOS({
		RETURN_URL: returnUrl,

		ELEMENT_ID: "payos-embedded-container",

		CHECKOUT_URL: checkoutUrl,

		embedded: true,

		onSuccess: () => {
			setIsPaymentOpen(false);

			pushNotification("Payment successful! Booking confirmed.", "success");

			dispatch(resetBooking());

			navigate("/");
		},

		onExit: () => {
			setIsPaymentOpen(false);
		},

		onCancel: () => {
			setIsCancelModalOpen(true);
		},
	});

	useEffect(() => {
		if (isPaymentOpen && checkoutUrl) {
			open();
		}
	}, [isPaymentOpen, checkoutUrl, open]);

	if (!bookingInfo || bookingInfo.items.length === 0) {
		if (paymentFailed) {
			return <PaymentFailureView />;
		}

		return (
			<Typography variant="h6" align="center" mt={5}>
				No booking found
			</Typography>
		);
	}

	const handleConfirmAndPay = async () => {
		try {
			setIsCreatingLink(true);

			let bookingId = createdBookingId;

			if (!bookingId) {
				const bookingRes = await confirmBooking(bookingInfo);

				bookingId = bookingRes.data.id;

				setCreatedBookingId(bookingId);
			}

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

	const handleCancelBooking = async () => {
		if (!createdBookingId) return;

		setLoadingCancelBooking(true);

		try {
			await bookingApi.cancel(createdBookingId);

			pushNotification("Booking cancelled successfully.", "info");

			exit();

			dispatch(resetBooking());

			navigate("/");
		} catch (err) {
			console.error(err);

			pushNotification("Failed to cancel booking.", "error");
		} finally {
			setLoadingCancelBooking(false);

			setIsCancelModalOpen(false);
		}
	};

	const handleSkipPayment = () => {
		exit();

		dispatch(resetBooking());

		navigate("/");
	};

	if (paymentFailed) {
		return <PaymentFailureView />;
	}

	return (
		<Box
			sx={{
				width: "100%",
				maxWidth: 1600,
				mx: "auto",
				my: 4,
				px: {
					xs: 2,
					md: 4,
				},
			}}
		>
			<Typography
				variant="h3"
				fontWeight={800}
				textAlign="center"
				gutterBottom
				color="primary"
				sx={{
					mb: 4,
				}}
			>
				Checkout
			</Typography>

			{/* BOOKING SUMMARY */}
			<Box
				sx={{
					display: isPaymentOpen ? "none" : "flex",
					justifyContent: "center",
				}}
			>
				<Paper
					elevation={5}
					sx={{
						width: "100%",
						maxWidth: 720,
						p: 4,
						borderRadius: 5,
					}}
				>
					<Stack spacing={3}>
						<Box>
							<Typography variant="h5" fontWeight={700} gutterBottom>
								Booking Summary
							</Typography>

							<Typography variant="body2" color="text.secondary">
								Review your booking before payment.
							</Typography>
						</Box>

						<Divider />

						<Box>
							<Typography variant="subtitle2" color="text.secondary">
								Check-in
							</Typography>

							<Typography variant="body1" fontWeight={600}>
								{formatDate(new Date(bookingInfo.startDate).toString())}
							</Typography>
						</Box>

						<Box>
							<Typography variant="subtitle2" color="text.secondary">
								Check-out
							</Typography>

							<Typography variant="body1" fontWeight={600}>
								{formatDate(new Date(bookingInfo.endDate).toString())}
							</Typography>
						</Box>

						<Box>
							<Typography variant="subtitle2" color="text.secondary">
								Guests
							</Typography>

							<Chip label={`${bookingInfo.guestCount} Guests`} color="primary" />
						</Box>

						<Divider />

						<Box>
							<Typography variant="h6" fontWeight={700} gutterBottom>
								Rooms / Beds
							</Typography>

							<List disablePadding>
								{selectedRooms.map((room) => {
									const bookingItem = bookingInfo.items.find((i) => i.id === room.id);

									return (
										<ListItem
											key={room.id}
											sx={{
												px: 0,
												py: 1.5,
												display: "flex",
												justifyContent: "space-between",
											}}
										>
											<Typography fontWeight={500}>{room.name}</Typography>

											<Chip label={`x ${bookingItem?.count ?? 0}`} size="small" />
										</ListItem>
									);
								})}
							</List>
						</Box>

						<Button
							variant="contained"
							size="large"
							fullWidth
							onClick={handleConfirmAndPay}
							disabled={confirming || isCreatingLink}
							sx={{
								height: 58,
								fontSize: "1rem",
								fontWeight: 700,
								borderRadius: 3,
							}}
						>
							{confirming || isCreatingLink ? "Processing..." : "Confirm & Pay Now"}
						</Button>
					</Stack>
				</Paper>
			</Box>

			{/* PAYMENT SCREEN */}
			<Box
				sx={{
					display: isPaymentOpen ? "flex" : "none",
					justifyContent: "center",
					alignItems: "center",
					py: 2,
				}}
			>
				<Paper
					elevation={8}
					sx={{
						width: "100%",
						maxWidth: 900,
						borderRadius: 6,
						overflow: "hidden",
						backgroundColor: "#fff",
					}}
				>
					{/* HEADER */}
					<Box
						sx={{
							px: 4,
							py: 2,
							textAlign: "center",
							borderBottom: "1px solid #f0f0f0",
						}}
					>
						<Typography
							variant="h4"
							fontWeight={800}
							sx={{
								mb: 0.5,
							}}
						>
							Complete Your Payment
						</Typography>

						<Typography variant="body2" color="text.secondary">
							Scan the QR code or complete the transfer below
						</Typography>
					</Box>

					{/* PAYMENT CONTENT */}
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							pt: 1.5,
							pb: 2,
							px: 2,
							backgroundColor: "#fafafa",
						}}
					>
						<Box
							sx={{
								width: "100%",
								maxWidth: 500,
								height: 540,
								borderRadius: 4,
								overflow: "hidden",
								backgroundColor: "#fff",
								boxShadow: "0 6px 24px rgba(0,0,0,0.08)",

								"& iframe": {
									width: "100% !important",
									height: "100% !important",
									border: "none",
									display: "block",

									transform: "scale(1.32)",
									transformOrigin: "top center",
								},
							}}
						>
							<div
								id="payos-embedded-container"
								style={{
									width: "100%",
									height: "100%",
								}}
							/>
						</Box>

						<Button
							variant="outlined"
							color="secondary"
							size="large"
							onClick={() => {
								setIsCancelModalOpen(true);
							}}
							sx={{
								mt: 1.5,
								minWidth: 220,
								height: 46,
								borderRadius: 3,
								fontWeight: 700,
							}}
						>
							Cancel Payment
						</Button>
					</Box>
				</Paper>
			</Box>

			{/* CANCELLATION MODAL */}
			<Dialog open={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} maxWidth="xs" fullWidth>
				<DialogTitle fontWeight={700}>Leave Payment?</DialogTitle>
				<DialogContent>
					<Typography variant="body1">Are you sure you want to leave payment? You can always come back and pay later from your profile.</Typography>
				</DialogContent>
				<DialogActions sx={{ flexDirection: "column", gap: 1, p: 3 }}>
					<Button variant="contained" fullWidth onClick={() => setIsCancelModalOpen(false)} sx={{ borderRadius: 2, py: 1.2, fontWeight: 700 }}>
						Back to Payment
					</Button>
					<Button variant="outlined" color="error" fullWidth onClick={handleCancelBooking} disabled={loadingCancelBooking} sx={{ borderRadius: 2, py: 1.2, fontWeight: 700 }}>
						{loadingCancelBooking ? "Cancelling..." : "Cancel this booking"}
					</Button>
					<Button variant="text" color="inherit" fullWidth onClick={handleSkipPayment} sx={{ borderRadius: 2, py: 1.2, fontWeight: 700 }}>
						Skip payment for now
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

function PaymentFailureView() {
	const navigate = useNavigate();

	return (
		<Box
			sx={{
				maxWidth: 700,
				mx: "auto",
				my: 10,
				p: {
					xs: 3,
					md: 6,
				},
			}}
		>
			<Paper
				elevation={4}
				sx={{
					p: 5,
					borderRadius: 5,
					textAlign: "center",
				}}
			>
				<Stack spacing={3}>
					<Typography variant="h4" color="error" fontWeight={700}>
						Payment Not Completed
					</Typography>

					<Typography variant="body1" color="text.secondary">
						You didn't complete the payment, but your booking is still saved.
					</Typography>

					<Typography variant="body1" fontWeight={600}>
						You can pay later in:
						<br />
						My Profile → My Bookings
					</Typography>

					<Button
						variant="contained"
						size="large"
						onClick={() => navigate("/user/me/my-bookings")}
						sx={{
							height: 54,
							borderRadius: 3,
						}}
					>
						Go to My Bookings
					</Button>
				</Stack>
			</Paper>
		</Box>
	);
}
