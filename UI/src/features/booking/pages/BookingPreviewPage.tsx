import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, Button, Checkbox, FormControlLabel, Snackbar, Alert, Divider } from "@mui/material";
import { useBookingContext } from "../hooks/useBookingContext";
import { MuiTelInput } from "mui-tel-input";
import { useFetchImages } from "../hooks/useFetchImages";
import type { MuiTelInputInfo } from "mui-tel-input";

export default function BookingPreviewPage() {
	const navigate = useNavigate();
	const { booking, setBooking } = useBookingContext();
	const { getAccomImage } = useFetchImages();
	const [images, setImages] = useState<string[]>([]);
	const [isEditing, setIsEditing] = useState(false);
	const [agreed, setAgreed] = useState(false);
	const [showPhoneField, setShowPhoneField] = useState(true);

	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "error" as "error" | "warning" | "success",
	});

	const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

	const handlePhoneChange = (value: string, info: MuiTelInputInfo) => {
		setBooking({
			...booking,
			user: { ...booking.user, phone: value },
		});
	};

	//  Enhanced validation logic
	const handleToggleEdit = () => {
		if (isEditing) {
			const phone = booking.user.phone.trim();

			// Check numeric only (no spaces, letters, or symbols)
			if (phone && !/^[0-9]+$/.test(phone)) {
				setSnackbar({
					open: true,
					message: "Please enter a valid phone number (numbers only).",
					severity: "warning",
				});
				return; //  don't exit edit mode
			}

			// If empty → hide field
			if (!phone) {
				setShowPhoneField(false);
			} else {
				setShowPhoneField(true);
			}
		}

		// Toggle edit mode
		setIsEditing(!isEditing);
	};

	const handleProceed = () => {
		if (!booking.user.name.trim()) {
			return setSnackbar({
				open: true,
				message: "Name cannot be empty.",
				severity: "error",
			});
		}

		if (!agreed) {
			return setSnackbar({
				open: true,
				message: "Please confirm that all information is correct.",
				severity: "warning",
			});
		}

		navigate("/booking/checkout", { state: { booking } });
	};
	useEffect(() => {
		if (booking?.room?.length) {
			const fetchImages = async () => {
				try {
					const allRoomImages = await Promise.all(
						booking.room.map(async (room) => {
							const response = await getAccomImage({
								entity: "Accommodation",
								id: room.id,
							});

							// Filter only WEBP images and get URLs
							return response.filter((img: { variant: string }) => img.variant === "WEBP").map((img: { url: string }) => img.url);
						})
					);

					// Flatten array of arrays
					setImages(allRoomImages.flat());
				} catch (err) {
					console.error("Error fetching room images:", err);
				}
			};

			fetchImages();
		}
	}, [booking]);

	return (
		<Box sx={{ maxWidth: 600, mx: "auto", mt: 5, px: 2 }}>
			<Typography variant="h4" gutterBottom>
				Booking Preview
			</Typography>

			{/* === User Info === */}
			<Card sx={{ mb: 3 }}>
				<CardContent>
					<Box display="flex" justifyContent="space-between" alignItems="center">
						<Typography variant="h6">User Information</Typography>
						<Button size="small" onClick={handleToggleEdit}>
							{isEditing ? "Done" : "Edit"}
						</Button>
					</Box>

					<Typography sx={{ mt: 1 }}>
						<strong>Name:</strong> {booking.user.name}
					</Typography>
					<Typography>
						<strong>Email:</strong> {booking.user.email}
					</Typography>

					<Box mt={1}>
						{isEditing ? (
							<MuiTelInput fullWidth label="Phone" value={booking.user.phone} onChange={handlePhoneChange} size="small" />
						) : (
							showPhoneField && (
								<Typography>
									<strong>Phone:</strong> {booking.user.phone}
								</Typography>
							)
						)}
					</Box>
				</CardContent>
			</Card>

			{/* === Accommodation Info === */}
			<Card sx={{ mb: 3 }}>
				<CardContent>
					<Typography variant="h6">Accommodation Information</Typography>
					<Typography sx={{ mt: 1 }}>
						<strong>{booking.accommodation.name}</strong>
						<br />
						{booking.accommodation.address}
					</Typography>
					<Divider sx={{ my: 1 }} />
					<Typography>
						<strong>Check-in:</strong> {booking.startDate.toDateString()}
					</Typography>
					<Typography>
						<strong>Check-out:</strong> {booking.endDate.toDateString()}
					</Typography>
					<Typography>
						<strong>Guests:</strong> {booking.guestCount}
					</Typography>
					<Typography>
						<strong>Reference No:</strong> {booking.referenceNo}
					</Typography>
					{images.length > 0 && (
						<Box mt={2} display="flex" flexWrap="wrap" gap={1}>
							{images.map((url, idx) => (
								<img key={idx} src={url} alt={`Accommodation ${idx + 1}`} style={{ width: "100%", maxWidth: 250, borderRadius: 8 }} />
							))}
						</Box>
					)}
				</CardContent>
			</Card>

			{/* === Rooms === */}
			<Card sx={{ mb: 3 }}>
				<CardContent>
					<Typography variant="h6">Rooms / Beds</Typography>
					<ul style={{ marginTop: 8 }}>
						{booking.room &&
							booking.room.map((r) => (
								<li key={r.id}>
									{r.name} ({r.type})
								</li>
							))}
					</ul>
				</CardContent>
			</Card>

			{/* === Confirmation === */}
			<FormControlLabel control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />} label="I confirm that all the information I provided is correct." />

			<Button variant="contained" color="primary" fullWidth sx={{ mt: 2, py: 1.2 }} onClick={handleProceed}>
				Proceed to Payment
			</Button>

			{/* Snackbar */}
			<Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
				<Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
