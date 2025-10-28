import React from 'react';
import { Box, Typography } from '@mui/material';
import type { BookingDto } from '../types/BookingDto';

interface Props {
    startDate: BookingDto['startDate'];
    endDate: BookingDto['endDate'];
}

export const BookingDatesBox: React.FC<Props> = ({ startDate, endDate }) => {
    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-GB', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });

    return (
        <Box p={2} borderRadius={2} boxShadow={2} mb={3}>
            <Typography variant="h6" gutterBottom>
                Stay Dates
            </Typography>
            <Typography>
                <b>Check-in:</b> {formatDate(startDate)}
            </Typography>
            <Typography>
                <b>Check-out:</b> {formatDate(endDate)}
            </Typography>
        </Box>
    );
};
