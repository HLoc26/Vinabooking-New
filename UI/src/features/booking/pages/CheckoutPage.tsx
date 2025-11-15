import { useLocation, useNavigate } from "react-router-dom";
import { useConfirmBooking } from "../hooks/useConfirmBooking";
import { useState, useEffect } from "react";
import type { BookingDto } from "../services/types/BookingDto";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";

export default function CheckoutPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const booking: BookingDto = location.state?.booking;
	const { confirmBooking, loading } = useConfirmBooking();
	const { pushNotification } = usePushNotificationContext();
	const [qrUrl, setQrUrl] = useState("");

	console.log("Booking ", booking);

	useEffect(() => {
		// generate a random fake QR code
		setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=BOOKING_${booking.id}`);
	}, [booking.id]);

	if (!booking) return <p style={{ textAlign: "center", marginTop: "2rem" }}>No booking found</p>;

	const handleConfirm = async () => {
		try {
			await confirmBooking(booking);
			pushNotification("Booking confirmed successfully! Please check your booking history.", "success");
			// navigate after a short delay
			setTimeout(() => navigate("/", { state: { booking } }), 1500);
		} catch {
			pushNotification("Failed to confirm booking. Please try again.", "error");
		}
	};

	return (
		<div style={{ maxWidth: 600, margin: "2rem auto", textAlign: "center" }}>
			<h2>Checkout</h2>

			{qrUrl ? <img src={qrUrl} alt="QR Code" style={{ margin: "1rem 0" }} /> : null}

			<div style={{ marginBottom: "1rem", textAlign: "left" }}>
				<h3>Booking Summary</h3>
				<p>
					<strong>Accommodation:</strong> {booking.accommodation.name}
				</p>
				<p>
					<strong>Address:</strong> {booking.accommodation.address}
				</p>
				<p>
					<b>Check in:</b>{" "}
					{new Date(booking.startDate).toLocaleDateString("en-GB", {
						day: "2-digit",
						month: "short",
						year: "numeric",
					})}{" "}
				</p>
				<p>
					<b>Check out:</b>{" "}
					{new Date(booking.endDate).toLocaleDateString("en-GB", {
						day: "2-digit",
						month: "short",
						year: "numeric",
					})}{" "}
				</p>
				<p>
					<strong>Guests:</strong> {booking.guestCount}
				</p>

				<h4>Rooms / Beds</h4>
				<ul>
					{booking.room.map((room) => (
						<li key={room.id}>
							{room.name} ({room.type})
						</li>
					))}
				</ul>
			</div>

			<button
				onClick={handleConfirm}
				disabled={loading}
				style={{
					padding: "0.6rem 1.2rem",
					border: "none",
					borderRadius: 6,
					backgroundColor: "#1976d2",
					color: "white",
					cursor: "pointer",
				}}
			>
				{loading ? "Processing..." : "Confirm Booking"}
			</button>
		</div>
	);
}
