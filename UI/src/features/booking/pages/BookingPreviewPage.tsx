import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, CircularProgress, Button, Typography } from '@mui/material';
import { useFetchBookingInfo } from '../hooks/useFetchBookingInfo';
import { UserInfoForm } from '../components/UserInfoForm';
import { AccommodationInfoBox } from '../components/AccommodationInfoBox';
import { AgreementCheckbox } from '../components/ArgeementCheckbox';
import { BookingDatesBox } from '../components/BookingDatesBox';

export const BookingPreviewPage: React.FC = () => {
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();
    const { data, loading } = useFetchBookingInfo(bookingId ?? '');

    if (loading) return <CircularProgress />;

    if (!data) return <Typography color="error">Failed to load booking info.</Typography>;

    return (
        <Box maxWidth={600} mx="auto" mt={4}>
            <Typography variant="h5" gutterBottom>
                Booking Preview
            </Typography>

            <UserInfoForm user={data.user} />
            <BookingDatesBox startDate={data.startDate} endDate={data.endDate} />
            <AccommodationInfoBox booking={data} />

            <AgreementCheckbox />

            <Button
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => navigate(`/payment/${bookingId}`)}
            >
                Proceed to Payment
            </Button>
        </Box>
    );
};
