import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { BookingDto } from "../types/BookingDto";

export default function BookingPreviewPage() {
	const navigate = useNavigate();

	// Mock booking data
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

	const handleEdit = () => setIsEditing(true);

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) =>
		setBooking({
			...booking,
			user: { ...booking.user, phone: e.target.value },
		});

	const handleProceed = () => {
		if (!booking.user.name.trim()) return alert("Name cannot be empty.");
		if (!agreed) return alert("Please confirm that all information is correct.");
		navigate("/checkout", { state: { booking } });
	};

	return (
		<div style={{ maxWidth: 600, margin: "2rem auto" }}>
			<h2>Booking Preview</h2>

			<div style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: 8 }}>
				<h3>User Information</h3>
				<button onClick={handleEdit} style={{ float: "right", marginBottom: 8 }}>
					Edit
				</button>
				<p>
					<strong>Name:</strong> {booking.user.name}
				</p>
				<p>
					<strong>Email:</strong> {booking.user.email}
				</p>
				<p>
					<strong>Phone:</strong> {isEditing ? <input type="text" value={booking.user.phone} onChange={handlePhoneChange} /> : booking.user.phone}
				</p>
			</div>

			<div style={{ marginTop: "1rem" }}>
				<h3>Accommodation Information</h3>
				<p>
					<strong>{booking.accommodation.name}</strong>
					<br />
					{booking.accommodation.address}
				</p>
				<p>
					<strong>Check-in:</strong> {booking.startDate.toISOString()}
				</p>
				<p>
					<strong>Check-out:</strong> {booking.endDate.toISOString()}
				</p>
				<p>
					<strong>Guests:</strong> {booking.guestCount}
				</p>
				<p>
					<strong>Reference No:</strong> {booking.referenceNo}
				</p>
			</div>

			<div style={{ marginTop: "1rem" }}>
				<h3>Rooms / Beds</h3>
				<ul>
					{booking.rooms.map((r) => (
						<li key={r.id}>
							{r.name} ({r.type})
						</li>
					))}
				</ul>
			</div>

			<div style={{ marginTop: "1rem" }}>
				<label>
					<input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} /> I agree that all the information I provided is correct according to my current status.
				</label>
			</div>

			<button onClick={handleProceed} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
				Proceed to Payment
			</button>
		</div>
	);
}
