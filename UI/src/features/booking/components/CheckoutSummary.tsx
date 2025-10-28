// src/booking/components/CheckoutSummary.tsx
import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import type { BookingDto } from '../types/BookingDto';

interface Props {
    booking: BookingDto;
}

export const CheckoutSummary: React.FC<Props> = ({ booking }) => {
    const formatDate = (s: string) =>
        new Date(s).toLocaleString(undefined, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    return (
        <Box p={2} borderRadius={2} boxShadow={2} mb={2}>
            <Typography variant="h6">Booking Summary</Typography>
            <Typography>
                <b>Check-in:</b> {formatDate(booking.startDate)}
            </Typography>
            <Typography>
                <b>Check-out:</b> {formatDate(booking.endDate)}
            </Typography>
            <Typography>
                <b>Guests:</b> {booking.guestCount}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1">Accommodation</Typography>
            <Typography>{booking.accommodation?.name}</Typography>
            <Typography variant="body2" color="text.secondary">
                {booking.accommodation?.address}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1">Items</Typography>
            <List dense>
                {booking.rooms.map((r) => (
                    <ListItem key={r.id}>
                        <ListItemText
                            primary={`${r.type === 'ROOM' ? 'Room' : 'Bed'}: ${r.name}`}
                            secondary={r.note ?? undefined}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};
