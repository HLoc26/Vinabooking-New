import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Chip,
    Rating,
    Button,
    Divider,
    Card,
    CardContent,
    IconButton,
    Dialog,
    ImageList,
    ImageListItem,
    Stack,
    Avatar,
    TextField,
    Tab,
    Tabs,
} from '@mui/material';
import {
    LocationOn,
    Wifi,
    Pool,
    FitnessCenter,
    Restaurant,
    LocalParking,
    AcUnit,
    Close,
    Share,
    Favorite,
    FavoriteBorder,
    Star,
    Person,
    SquareFoot,
    Hotel,
    Bathtub,
} from '@mui/icons-material';
// import { AccommodationDetailDto } from '../types';

const mockAccommodationDetail = {
    id: 'mock-123',
    name: 'Muong Thanh Grand Saigon Centre Hotel',
    description:
        'Ideally located in the heart of District 1, Muong Thanh Grand Saigon Centre Hotel offers modern and luxurious accommodation with free WiFi access throughout the property. It features a rooftop swimming pool, fitness centre and sauna facility.',
    type: 'HOTEL',
    address: {
        street: '8-8A Mac Dinh Chi',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        fullAddress: '8-8A Mac Dinh Chi, Ben Nghe Ward, District 1, Ho Chi Minh City, Vietnam',
        latitude: 10.7839,
        longitude: 106.6995,
    },
    facilities: [
        { facility: { id: 'f1', name: 'Free WiFi', type: 'GENERAL' }, note: 'High speed' },
        { facility: { id: 'f2', name: 'Swimming Pool', type: 'PUBLIC_FACILITIES' } },
        { facility: { id: 'f3', name: 'Air Conditioning', type: 'GENERAL' } },
        { facility: { id: 'f4', name: 'Private Bathroom', type: 'BATHROOM' } },
        { facility: { id: 'f5', name: 'Fitness Center', type: 'WELLNESS' } },
        { facility: { id: 'f6', name: 'Parking', type: 'TRANSPORTATION' } },
        { facility: { id: 'f7', name: 'Restaurant', type: 'FOOD_AND_DRINK' } },
        { facility: { id: 'f8', name: '24-hour front desk', type: 'SERVICES' } },
    ],
    images: [
        {
            id: 'img1',
            variants: [
                {
                    s3Key: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
                    variant: 'OPTIMIZED',
                },
            ],
            isPrimary: true,
        },
        {
            id: 'img2',
            variants: [
                {
                    s3Key: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400',
                    variant: 'OPTIMIZED',
                },
            ],
        },
        {
            id: 'img3',
            variants: [
                {
                    s3Key: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
                    variant: 'OPTIMIZED',
                },
            ],
        },
        {
            id: 'img4',
            variants: [
                {
                    s3Key: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
                    variant: 'OPTIMIZED',
                },
            ],
        },
        {
            id: 'img5',
            variants: [
                {
                    s3Key: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400',
                    variant: 'OPTIMIZED',
                },
            ],
        },
    ],
    rooms: [
        {
            id: 'r1',
            name: 'Deluxe King Room',
            price: 150,
            maxAdults: 2,
            maxChildren: 1,
            size: 30,
            beds: [{ bedType: 'KING' }],
            amenities: [{ amenity: { id: 'a1', name: 'City View', type: 'COMFORT' } }],
        },
        {
            id: 'r2',
            name: 'Superior Twin Room',
            price: 120,
            maxAdults: 2,
            maxChildren: 0,
            size: 25,
            beds: [{ bedType: 'TWIN' }],
            amenities: [
                { amenity: { id: 'a2', name: 'Breakfast Included', type: 'FOOD_AND_DRINK' } },
            ],
        },
        {
            id: 'r3',
            name: 'Executive Suite',
            price: 250,
            maxAdults: 3,
            maxChildren: 2,
            size: 50,
            beds: [{ bedType: 'KING' }, { bedType: 'SOFA_BED' }],
            amenities: [
                { amenity: { id: 'a3', name: 'Bathtub', type: 'BATHROOM' } },
                { amenity: { id: 'a1', name: 'City View', type: 'COMFORT' } },
            ],
        },
    ],
    reviews: [
        {
            id: 'rev1',
            star: 5,
            comment: 'Excellent location and friendly staff. The rooftop pool is amazing!',
            createdAt: '2025-10-27T10:00:00Z',
            userId: 'userA',
        },
        {
            id: 'rev2',
            star: 4,
            comment: 'Good value for money. Room was clean and comfortable.',
            createdAt: '2025-10-26T15:30:00Z',
            userId: 'userB',
        },
        {
            id: 'rev3',
            star: 3,
            comment: 'Breakfast could be better, but overall a decent stay.',
            createdAt: '2025-10-25T08:00:00Z',
            userId: 'userC',
        },
    ],
    averageRating: 4.0,
    numberOfReviews: 3,
};

const facilityIcons: { [key: string]: React.ReactElement } = {
    GENERAL: <Wifi sx={{ fontSize: 20 }} />,
    PUBLIC_FACILITIES: <Pool sx={{ fontSize: 20 }} />,
    BATHROOM: <Bathtub sx={{ fontSize: 20 }} />,
    WELLNESS: <FitnessCenter sx={{ fontSize: 20 }} />,
    TRANSPORTATION: <LocalParking sx={{ fontSize: 20 }} />,
    FOOD_AND_DRINK: <Restaurant sx={{ fontSize: 20 }} />,
    SERVICES: <AcUnit sx={{ fontSize: 20 }} />,
    DEFAULT: <AcUnit sx={{ fontSize: 20 }} />,
};

const AccommodationDetailPage: React.FC = () => {
    const [openGallery, setOpenGallery] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    const accommodation = mockAccommodationDetail;

    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', pb: 4 }}>
            {/* Hero Image Gallery */}
            <Box sx={{ position: 'relative', height: 500, bgcolor: '#000' }}>
                <Grid container sx={{ height: '100%' }} spacing={0.5}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box
                            component="img"
                            src={accommodation.images[0].variants[0].s3Key}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                cursor: 'pointer',
                            }}
                            onClick={() => setOpenGallery(true)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Grid container spacing={0.5} sx={{ height: '100%' }}>
                            {accommodation.images.slice(1, 5).map((img, idx) => (
                                <Grid size={{ xs: 6 }} key={img.id}>
                                    <Box
                                        component="img"
                                        src={img.variants[0].s3Key}
                                        sx={{
                                            width: '100%',
                                            height: idx < 2 ? 249.5 : 249.5,
                                            objectFit: 'cover',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => setOpenGallery(true)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
                <Button
                    variant="contained"
                    sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        bgcolor: 'white',
                        color: 'black',
                        '&:hover': { bgcolor: '#f0f0f0' },
                    }}
                    onClick={() => setOpenGallery(true)}
                >
                    Show all photos
                </Button>
            </Box>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Grid container spacing={3}>
                    {/* Main Content */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        {/* Header */}
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'start',
                                    mb: 2,
                                }}
                            >
                                <Box>
                                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                                        {accommodation.name}
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            mb: 1,
                                        }}
                                    >
                                        <Box
                                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                        >
                                            <Rating
                                                value={accommodation.averageRating}
                                                precision={0.1}
                                                readOnly
                                                size="small"
                                            />
                                            <Typography variant="body2" fontWeight="bold">
                                                {accommodation.averageRating}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                ({accommodation.numberOfReviews} reviews)
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={accommodation.type}
                                            size="small"
                                            color="primary"
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <LocationOn sx={{ fontSize: 18, color: 'primary.main' }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {accommodation.address.fullAddress}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton onClick={() => setIsFavorite(!isFavorite)}>
                                        {isFavorite ? (
                                            <Favorite color="error" />
                                        ) : (
                                            <FavoriteBorder />
                                        )}
                                    </IconButton>
                                    <IconButton>
                                        <Share />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Tabs */}
                        <Paper sx={{ mb: 3 }}>
                            <Tabs
                                value={tabValue}
                                onChange={(_, v) => setTabValue(v)}
                                variant="fullWidth"
                            >
                                <Tab label="Overview" />
                                <Tab label="Rooms" />
                                <Tab label="Reviews" />
                            </Tabs>
                        </Paper>

                        {/* Overview Tab */}
                        {tabValue === 0 && (
                            <>
                                {/* Description */}
                                <Paper sx={{ p: 3, mb: 3 }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        About this property
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" paragraph>
                                        {accommodation.description}
                                    </Typography>
                                </Paper>

                                {/* Facilities */}
                                <Paper sx={{ p: 3, mb: 3 }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        Facilities & Services
                                    </Typography>
                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        {accommodation.facilities.map((f) => (
                                            <Grid size={{ xs: 12, sm: 6 }} key={f.facility.id}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1.5,
                                                    }}
                                                >
                                                    {facilityIcons[f.facility.type] ||
                                                        facilityIcons.DEFAULT}
                                                    <Box>
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight="500"
                                                        >
                                                            {f.facility.name}
                                                        </Typography>
                                                        {f.note && (
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {f.note}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Paper>

                                {/* Map Section (Optional) */}
                                <Paper sx={{ p: 3, mb: 3 }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        Location
                                    </Typography>
                                    <Box
                                        sx={{
                                            height: 300,
                                            bgcolor: '#e0e0e0',
                                            borderRadius: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Typography color="text.secondary">
                                            Map will be integrated here (Google Maps/Mapbox)
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mt: 2 }}
                                    >
                                        {accommodation.address.fullAddress}
                                    </Typography>
                                </Paper>
                            </>
                        )}

                        {/* Rooms Tab */}
                        {tabValue === 1 && (
                            <Box>
                                {accommodation.rooms.map((room) => (
                                    <Card key={room.id} sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, md: 8 }}>
                                                    <Typography
                                                        variant="h6"
                                                        fontWeight="bold"
                                                        gutterBottom
                                                    >
                                                        {room.name}
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            flexWrap: 'wrap',
                                                            gap: 2,
                                                            mb: 2,
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 0.5,
                                                            }}
                                                        >
                                                            <Person sx={{ fontSize: 18 }} />
                                                            <Typography variant="body2">
                                                                {room.maxAdults} adults,{' '}
                                                                {room.maxChildren} children
                                                            </Typography>
                                                        </Box>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 0.5,
                                                            }}
                                                        >
                                                            <SquareFoot sx={{ fontSize: 18 }} />
                                                            <Typography variant="body2">
                                                                {room.size} m²
                                                            </Typography>
                                                        </Box>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 0.5,
                                                            }}
                                                        >
                                                            <Hotel sx={{ fontSize: 18 }} />
                                                            <Typography variant="body2">
                                                                {room.beds
                                                                    .map((b) => b.bedType)
                                                                    .join(', ')}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            flexWrap: 'wrap',
                                                            gap: 1,
                                                        }}
                                                    >
                                                        {room.amenities.map((a) => (
                                                            <Chip
                                                                key={a.amenity.id}
                                                                label={a.amenity.name}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        ))}
                                                    </Box>
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 4 }}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'flex-end',
                                                            justifyContent: 'space-between',
                                                            height: '100%',
                                                        }}
                                                    >
                                                        <Box sx={{ textAlign: 'right' }}>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                Starting from
                                                            </Typography>
                                                            <Typography
                                                                variant="h5"
                                                                fontWeight="bold"
                                                                color="primary"
                                                            >
                                                                ${room.price}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                per night
                                                            </Typography>
                                                        </Box>
                                                        <Button
                                                            variant="contained"
                                                            fullWidth
                                                            sx={{ mt: 2 }}
                                                        >
                                                            Book Now
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        )}

                        {/* Reviews Tab */}
                        {tabValue === 2 && (
                            <Paper sx={{ p: 3 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 3,
                                    }}
                                >
                                    <Typography variant="h6" fontWeight="bold">
                                        Guest Reviews
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Star sx={{ color: '#ffa726' }} />
                                        <Typography variant="h6" fontWeight="bold">
                                            {accommodation.averageRating}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            ({accommodation.numberOfReviews} reviews)
                                        </Typography>
                                    </Box>
                                </Box>
                                <Divider sx={{ mb: 3 }} />
                                <Stack spacing={3}>
                                    {accommodation.reviews.map((review) => (
                                        <Box key={review.id}>
                                            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                    {review.userId.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'start',
                                                        }}
                                                    >
                                                        <Box>
                                                            <Typography
                                                                variant="subtitle2"
                                                                fontWeight="bold"
                                                            >
                                                                {review.userId}
                                                            </Typography>
                                                            <Rating
                                                                value={review.star}
                                                                readOnly
                                                                size="small"
                                                            />
                                                        </Box>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            {new Date(
                                                                review.createdAt,
                                                            ).toLocaleDateString()}
                                                        </Typography>
                                                    </Box>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ mt: 1 }}
                                                    >
                                                        {review.comment}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Divider sx={{ mt: 2 }} />
                                        </Box>
                                    ))}
                                </Stack>
                                <Button variant="outlined" fullWidth sx={{ mt: 3 }}>
                                    Load More Reviews
                                </Button>
                            </Paper>
                        )}
                    </Grid>

                    {/* Booking Card (Sticky Sidebar) */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper
                            sx={{
                                p: 3,
                                position: 'sticky',
                                top: 16,
                                boxShadow: 3,
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Book Your Stay
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Starting from
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" color="primary">
                                    $120
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    per night
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Stack spacing={2}>
                                <TextField
                                    label="Check-in"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    defaultValue="2025-11-01"
                                />
                                <TextField
                                    label="Check-out"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    defaultValue="2025-11-03"
                                />
                                <TextField
                                    label="Guests"
                                    type="number"
                                    fullWidth
                                    defaultValue={2}
                                />
                                <Button variant="contained" size="large" fullWidth>
                                    Check Availability
                                </Button>
                            </Stack>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mt: 2, textAlign: 'center' }}
                            >
                                ✓ Free cancellation available
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', textAlign: 'center' }}
                            >
                                ✓ No payment needed today
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* Image Gallery Dialog */}
            <Dialog
                open={openGallery}
                onClose={() => setOpenGallery(false)}
                maxWidth="lg"
                fullWidth
            >
                <Box sx={{ position: 'relative', p: 2, bgcolor: '#000' }}>
                    <IconButton
                        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, bgcolor: 'white' }}
                        onClick={() => setOpenGallery(false)}
                    >
                        <Close />
                    </IconButton>
                    <Typography variant="h6" color="white" sx={{ mb: 2, pl: 1 }}>
                        {accommodation.name}
                    </Typography>
                    <ImageList cols={2} gap={8}>
                        {accommodation.images.map((img) => (
                            <ImageListItem key={img.id}>
                                <img
                                    src={img.variants[0].s3Key}
                                    alt={accommodation.name}
                                    loading="lazy"
                                    style={{ borderRadius: 8 }}
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                </Box>
            </Dialog>
        </Box>
    );
};

export default AccommodationDetailPage;
