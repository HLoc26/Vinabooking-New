import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, Button, TextField, Checkbox, FormControlLabel, Snackbar, Alert, Divider } from "@mui/material";
import type { BookingDto } from "../types/BookingDto";

export default function BookingPreviewPage() {
	const navigate = useNavigate();

	const [booking, setBooking] = useState<BookingDto>({
		id: "TEMP_" + Math.random().toString(36).substring(2, 9),
		startDate: new Date("2024-12-15"),
		endDate: new Date("2024-12-20"),
		guestCount: 3,
		user: {
			name: "Linh Tran",
			email: "linh.tran@example.com",
			phone: "0909123456",
		},
		referenceNo: 31312313,
		accommodation: {
			name: "Vinabooking Riverside Hotel",
			address: "123 Nguyen Hue, District 1, Ho Chi Minh City",
		},
		rooms: [
			{ id: "R1", name: "Deluxe Room 101", type: "ROOM" },
			{ id: "B1", name: "Bed A - Shared Dorm", type: "BED" },
		],
	});

	const [isEditing, setIsEditing] = useState(false);
	const [agreed, setAgreed] = useState(false);
	const [showPhoneField, setShowPhoneField] = useState(true);

	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "error" as "error" | "warning" | "success",
	});

	const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setBooking({
			...booking,
			user: { ...booking.user, phone: e.target.value },
		});
	};

	// ✅ Enhanced validation logic
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
				return; // ❌ don't exit edit mode
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

		navigate("/checkout", { state: { booking } });
	};

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
							<TextField fullWidth label="Phone" value={booking.user.phone} onChange={handlePhoneChange} size="small" />
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
				</CardContent>
			</Card>

			{/* === Rooms === */}
			<Card sx={{ mb: 3 }}>
				<CardContent>
					<Typography variant="h6">Rooms / Beds</Typography>
					<ul style={{ marginTop: 8 }}>
						{booking.rooms.map((r) => (
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
