import { useLocation, useNavigate } from "react-router-dom";
import { useConfirmBooking } from "../hooks/useConfirmBooking";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";
import type { RoomInfo } from "../types/RoomInfo";
import type { AccommodationInfo } from "../types/Accommodation";
import { Box, Typography, Button, Paper, List, ListItem, Divider } from "@mui/material";
import useBookingContextProvider from "../../../context/BookingContext/hook";

export default function CheckoutPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const roomInfo: RoomInfo[] = location.state?.rooms;
	const accommodation: AccommodationInfo = location.state?.accommodation;
	const { bookingInfo } = useBookingContextProvider();

	const { confirmBooking, loading } = useConfirmBooking();
	const { pushNotification } = usePushNotificationContext();

	if (!bookingInfo)
		return (
			<Typography variant="h6" align="center" mt={5}>
				No booking found
			</Typography>
		);

	const handleConfirm = async () => {
		try {
			await confirmBooking(bookingInfo, roomInfo);
			pushNotification("Booking confirmed successfully! Please check your booking history.", "success");
			setTimeout(() => navigate("/"), 3000);
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
					<strong>Accommodation:</strong> {accommodation.name}
				</Typography>
				<Typography>
					<strong>Address:</strong> {accommodation.address.fullAddress}
				</Typography>
				<Typography>
					<strong>Check-in:</strong>{" "}
					{new Date(bookingInfo.startDate).toLocaleDateString("en-GB", {
						day: "2-digit",
						month: "short",
						year: "numeric",
					})}
				</Typography>
				<Typography>
					<strong>Check-out:</strong>{" "}
					{new Date(bookingInfo.endDate).toLocaleDateString("en-GB", {
						day: "2-digit",
						month: "short",
						year: "numeric",
					})}
				</Typography>
				<Typography>
					<strong>Guests:</strong> {bookingInfo.guestCount}
				</Typography>

				<Divider sx={{ my: 2 }} />

				<Typography variant="subtitle1" gutterBottom>
					Rooms / Beds
				</Typography>
				<List>
					{roomInfo.map((room) => (
						<ListItem key={room.id} sx={{ pl: 0 }}>
							- {room.name}
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
