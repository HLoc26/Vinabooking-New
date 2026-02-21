import { useNavigate } from "react-router-dom";
import { useConfirmBooking } from "../hooks/useConfirmBooking";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";
import { Box, Typography, Button, Paper, List, ListItem, Divider } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../../app/store";
import { resetBooking } from "../../../features/booking/bookingSlice";
import { formatDate } from "../../../utils/dateFormatter";

export default function CheckoutPage() {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const bookingInfo = useSelector((state: RootState) => state.booking);

	const { confirmBooking, loading } = useConfirmBooking();
	const { pushNotification } = usePushNotificationContext();

	// If booking was cleared or never existed
	if (!bookingInfo || bookingInfo.items.length === 0) {
		return (
			<Typography variant="h6" align="center" mt={5}>
				No booking found
			</Typography>
		);
	}

	const handleConfirm = async () => {
		try {
			await confirmBooking(bookingInfo);

			pushNotification("Booking confirmed successfully! Please check your booking history.", "success");

			dispatch(resetBooking()); //Clear booking after success

			setTimeout(() => navigate("/"), 2000);
		} catch {
			pushNotification("Failed to confirm booking. Please try again.", "error");
		}
	};

	return (
		<Box
			sx={{
				maxWidth: 700,
				mx: "auto",
				my: 5,
				p: 4,
				borderRadius: 3,
				boxShadow: 3,
				backgroundColor: "background.paper",
			}}
		>
			<Typography variant="h4" align="center" gutterBottom color="primary">
				Checkout
			</Typography>

			<Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
				<Typography variant="h6" gutterBottom>
					Booking Summary
				</Typography>

				<Typography>
					<strong>Check-in:</strong> {formatDate(new Date(bookingInfo.startDate).toString())}
				</Typography>

				<Typography>
					<strong>Check-out:</strong> {formatDate(new Date(bookingInfo.endDate).toString())}
				</Typography>

				<Typography>
					<strong>Guests:</strong> {bookingInfo.guestCount}
				</Typography>

				<Divider sx={{ my: 2 }} />

				<Typography variant="subtitle1" gutterBottom>
					Rooms / Beds
				</Typography>

				<List>
					{bookingInfo.items.map((item) => (
						<ListItem key={item.id} sx={{ pl: 0 }}>
							- {item.id} × {item.count}
						</ListItem>
					))}
				</List>
			</Paper>

			<Button variant="contained" color="primary" fullWidth size="large" onClick={handleConfirm} disabled={loading}>
				{loading ? "Processing..." : "Confirm Booking"}
			</Button>
		</Box>
	);
}
