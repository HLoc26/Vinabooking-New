import { useLocation, useNavigate } from 'react-router-dom';
import { useConfirmBooking } from '../hooks/useConfirmBooking';
import type { BookingDto } from '../types/BookingDto';
import { useState, useEffect } from 'react';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const booking = location.state?.booking as BookingDto;

    const { confirmBooking, loading } = useConfirmBooking();
    const [qrUrl, setQrUrl] = useState('');

    useEffect(() => {
        // generate a random fake QR code
        const randomId = Math.floor(Math.random() * 1_000_000_000);
        setQrUrl(
            `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=BOOKING_${randomId}`,
        );
    }, []);

    if (!booking) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>No booking found</p>;

    const handleConfirm = async () => {
        try {
            await confirmBooking(booking);
            alert('🎉 Booking confirmed successfully!');
            navigate('/bookings', { state: { booking } });
        } catch {
            alert('❌ Failed to confirm booking. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: '2rem auto', textAlign: 'center' }}>
            <h2>Checkout</h2>

            <img src={qrUrl} alt="QR Code" style={{ margin: '1rem 0' }} />

            <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                <h3>Booking Summary</h3>
                <p>
                    <strong>Accommodation:</strong> {booking.accommodation.name}
                </p>
                <p>
                    <strong>Address:</strong> {booking.accommodation.address}
                </p>
                <p>
                    <strong>Check-in:</strong> {booking.startDate}
                </p>
                <p>
                    <strong>Check-out:</strong> {booking.endDate}
                </p>
                <p>
                    <strong>Guests:</strong> {booking.guestCount}
                </p>
                <h4>Rooms / Beds</h4>
                <ul>
                    {booking.rooms.map((room) => (
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
                    padding: '0.6rem 1.2rem',
                    border: 'none',
                    borderRadius: 6,
                    backgroundColor: '#1976d2',
                    color: 'white',
                    cursor: 'pointer',
                }}
            >
                {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
        </div>
    );
}
