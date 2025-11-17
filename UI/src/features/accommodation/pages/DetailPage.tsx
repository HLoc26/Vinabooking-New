import React, { useState, useEffect } from "react";
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
	IconButton,
	Dialog,
	ImageList,
	ImageListItem,
	Stack,
	Avatar,
	TextField,
	Tab,
	Tabs,
	CircularProgress,
} from "@mui/material";
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
	Remove,
	Add,
	Visibility,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";

// Types
interface AccommodationDetailResponse {
	success: boolean;
	data: {
		id: string;
		name: string;
		description: string;
		type: string;
		rentalType: string;
		isActive: boolean;
		address: {
			id: string;
			street: string;
			ward: string;
			district: string;
			city: string;
			country: string;
			fullAddress: string;
			latitude: string;
			longitude: string;
		};
		facilities: Array<{
			id: string;
			fee: string;
			note: string | null;
			facility: {
				id: string;
				name: string;
				type: string;
				description: string;
			};
		}>;
		rooms: Array<{
			id: string;
			name: string;
			description: string;
			price: string;
			maxAdults: number;
			maxChildren: number;
			size: string;
			bedroomCount: number;
			bathroomCount: number;
			viewType: string;
			beds: Array<{
				id: string;
				name: string;
				bedType: string;
			}>;
			amenities: Array<{
				id: string;
				note: string | null;
				amenity: {
					id: string;
					name: string;
					type: string;
				};
			}>;
		}>;
		images: Array<{
			id: string;
			url: string;
			variant: string;
			imageId: string;
		}>;
	};
}

// Mock data for missing fields (Reviews, Rating, etc.)
const mockReviews = [
	{
		id: "rev1",
		star: 5,
		comment: "Excellent location and friendly staff. The rooftop pool is amazing!",
		createdAt: "2025-10-27T10:00:00Z",
		userId: "userA",
		userName: "John Doe",
	},
	{
		id: "rev2",
		star: 4,
		comment: "Good value for money. Room was clean and comfortable.",
		createdAt: "2025-10-26T15:30:00Z",
		userId: "userB",
		userName: "Jane Smith",
	},
	{
		id: "rev3",
		star: 5,
		comment: "Amazing experience! Will definitely come back.",
		createdAt: "2025-10-25T08:00:00Z",
		userId: "userC",
		userName: "Mike Johnson",
	},
	{
		id: "rev4",
		star: 4,
		comment: "Great hotel with excellent facilities. Breakfast was delicious.",
		createdAt: "2025-10-24T12:00:00Z",
		userId: "userD",
		userName: "Sarah Wilson",
	},
];

const mockAverageRating = 4.5;
const mockNumberOfReviews = mockReviews.length;

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
	const { accommodationId } = useParams<{ accommodationId: string }>();
	const [accommodation, setAccommodation] = useState<AccommodationDetailResponse["data"] | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [openGallery, setOpenGallery] = useState(false);
	const [isFavorite, setIsFavorite] = useState(false);
	const [tabValue, setTabValue] = useState(0);
	const [roomQuantities, setRoomQuantities] = useState<Record<string, number>>({});
	const [startDate, setStartDate] = useState<Date>(new Date("2025-11-07"));
	const [endDate, setEndDate] = useState<Date>(new Date("2025-11-10"));

	// Fetch accommodation data
	useEffect(() => {
		const fetchAccommodation = async () => {
			setLoading(true);
			try {
				const response = await fetch(`http://localhost:3000/accommodations/${accommodationId}`);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const result = await response.json();

				if (result.success) {
					setAccommodation(result.data);
				} else {
					setError(result.error || "Failed to load accommodation details");
				}
			} catch (err) {
				console.error("Fetch error:", err);
				setError("Could not connect to server");
			} finally {
				setLoading(false);
			}
		};

		if (accommodationId) {
			fetchAccommodation();
		}
	}, [accommodationId]);

	// Get optimized or original images
	const getDisplayImages = () => {
		if (!accommodation?.images) return [];

		// Group images by imageId
		const imageGroups = accommodation.images.reduce(
			(acc, img) => {
				if (!acc[img.imageId]) {
					acc[img.imageId] = [];
				}
				acc[img.imageId].push(img);
				return acc;
			},
			{} as Record<string, typeof accommodation.images>
		);

		// Get best variant for each image (prefer OPTIMIZED or WEBP)
		return Object.values(imageGroups)
			.map((group) => {
				const optimized = group.find((img) => img.variant === "OPTIMIZED");
				const webp = group.find((img) => img.variant === "WEBP");
				const original = group.find((img) => img.variant === "ORIGINAL");
				return (optimized || webp || original)!;
			})
			.filter((img) => img !== undefined);
	};

	const displayImages = getDisplayImages();

	const handleIncrease = (roomId: string, availableRooms: number) => {
		setRoomQuantities((prev) => {
			const currentQty = prev[roomId] || 0;
			if (currentQty < availableRooms) {
				return {
					...prev,
					[roomId]: currentQty + 1,
				};
			}
			return prev;
		});
	};

	const handleDecrease = (roomId: string) => {
		setRoomQuantities((prev) => {
			const currentQty = prev[roomId] || 0;
			if (currentQty > 0) {
				return {
					...prev,
					[roomId]: currentQty - 1,
				};
			}
			return prev;
		});
	};

	// Calculate number of nights
	const calculateNights = () => {
		if (endDate <= startDate) return 0;
		const diffTime = endDate.getTime() - startDate.getTime();
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	};

	const nights = calculateNights();

	// Calculate total price
	const calculateTotal = () => {
		if (!accommodation || nights <= 0) return 0;
		return Object.entries(roomQuantities).reduce((sum, [roomId, qty]) => {
			if (qty > 0) {
				const room = accommodation.rooms.find((r) => r.id === roomId);
				if (room) {
					return sum + qty * parseFloat(room.price) * nights;
				}
			}
			return sum;
		}, 0);
	};

	const totalPrice = calculateTotal();

	// Loading state
	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	// Error state
	if (error || !accommodation) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
				}}
			>
				<Typography variant="h5" color="error">
					{error || "Accommodation not found"}
				</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", pb: 4 }}>
			{/* Hero Image Gallery */}
			<Container maxWidth="lg" sx={{ pt: 2 }}>
				<Box
					sx={{
						position: "relative",
						height: { xs: 300, sm: 400, md: 500 },
						borderRadius: 2,
						overflow: "hidden",
						display: "grid",
						gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr" },
						gridTemplateRows: { xs: "1fr", md: "1fr 1fr" },
						gap: 1,
					}}
				>
					{displayImages.slice(0, 5).map((img, idx) => (
						<Box
							key={img.id}
							onClick={() => {
								setOpenGallery(true);
							}}
							sx={{
								position: "relative",
								gridColumn: idx === 0 ? { xs: "1", md: "1 / 2" } : "auto",
								gridRow: idx === 0 ? { xs: "1", md: "1 / 3" } : "auto",
								cursor: "pointer",
								overflow: "hidden",
								bgcolor: "#e0e0e0",
								display: idx > 0 && { xs: "none", md: "block" },
								"&::before": {
									content: '""',
									position: "absolute",
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									bgcolor: "rgba(0,0,0,0)",
									transition: "background-color 0.3s ease",
									zIndex: 1,
								},
								"&:hover::before": {
									bgcolor: "rgba(0,0,0,0.1)",
								},
								...(idx === 4 &&
									displayImages.length > 5 && {
										"&::after": {
											content: `"+${displayImages.length - 5} photos"`,
											position: "absolute",
											top: "50%",
											left: "50%",
											transform: "translate(-50%, -50%)",
											color: "white",
											fontSize: "1.2rem",
											fontWeight: "bold",
											zIndex: 2,
											textShadow: "0 2px 4px rgba(0,0,0,0.5)",
										},
										"&:hover::before": {
											bgcolor: "rgba(0,0,0,0.3)",
										},
									}),
							}}
						>
							<img
								src={img.url || "https://via.placeholder.com/800x600"}
								alt={`${accommodation.name} ${idx + 1}`}
								loading={idx === 0 ? "eager" : "lazy"}
								style={{
									width: "100%",
									height: "100%",
									objectFit: "cover",
									objectPosition: "center",
								}}
							/>
						</Box>
					))}

					{/* Show All Photos Button */}
					{displayImages.length > 0 && (
						<Button
							variant="contained"
							onClick={() => {
								setOpenGallery(true);
							}}
							sx={{
								position: "absolute",
								bottom: 16,
								right: 16,
								bgcolor: "white",
								color: "black",
								fontWeight: 600,
								boxShadow: 2,
								"&:hover": {
									bgcolor: "#f5f5f5",
									boxShadow: 3,
								},
								zIndex: 10,
							}}
						>
							Show all {displayImages.length} photos
						</Button>
					)}
				</Box>
			</Container>

			{/* Main Content */}
			<Container maxWidth="lg" sx={{ mt: 4 }}>
				<Grid container spacing={3}>
					<Grid size={{ xs: 12, md: 8 }}>
						{/* Header */}
						<Paper sx={{ p: 3, mb: 3 }}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "start",
									mb: 2,
								}}
							>
								<Box>
									<Typography variant="h4" fontWeight="bold" gutterBottom>
										{accommodation.name}
									</Typography>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 2,
											mb: 1,
										}}
									>
										{/* TODO: Replace with real rating from API */}
										<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
											<Rating value={mockAverageRating} precision={0.1} readOnly size="small" />
											<Typography variant="body2" fontWeight="bold">
												{mockAverageRating}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												({mockNumberOfReviews} reviews)
											</Typography>
										</Box>
										<Chip label={accommodation.type} size="small" color="primary" />
									</Box>
									<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
										<LocationOn sx={{ fontSize: 18, color: "primary.main" }} />
										<Typography variant="body2" color="text.secondary">
											{accommodation.address.fullAddress}
										</Typography>
									</Box>
								</Box>
								<Box sx={{ display: "flex", gap: 1 }}>
									<IconButton onClick={() => setIsFavorite(!isFavorite)}>{isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}</IconButton>
									<IconButton>
										<Share />
									</IconButton>
								</Box>
							</Box>
						</Paper>

						{/* Tabs */}
						<Paper sx={{ mb: 3 }}>
							<Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="fullWidth">
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
								<Paper
									sx={{
										p: 4,
										mb: 3,
										borderRadius: 2,
										border: "1px solid",
										borderColor: "divider",
										boxShadow: "none",
									}}
								>
									<Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
										Facilities & Services
									</Typography>

									<Grid container spacing={2}>
										{accommodation.facilities.map((f) => (
											<Grid size={{ xs: 12, sm: 6, md: 4 }} key={f.id}>
												<Box
													sx={{
														p: 2,
														borderRadius: 1.5,
														backgroundColor: "grey.50",
														transition: "background-color 0.2s",
														height: "100%",
														display: "flex",
														gap: 1.5,
														"&:hover": {
															backgroundColor: "grey.100",
														},
													}}
												>
													{/* Icon */}
													<Box
														sx={{
															color: "primary.main",
															display: "flex",
															alignItems: "flex-start",
															pt: 0.25,
															flexShrink: 0,
														}}
													>
														{React.cloneElement(facilityIcons[f.facility.type] || facilityIcons.DEFAULT, { sx: { fontSize: 20 } })}
													</Box>

													{/* Content */}
													<Box sx={{ flex: 1, minWidth: 0 }}>
														<Box
															sx={{
																display: "flex",
																alignItems: "flex-start",
																justifyContent: "space-between",
																gap: 1.5,
																mb: f.note ? 0.5 : 0,
															}}
														>
															<Typography
																variant="body2"
																fontWeight="500"
																sx={{
																	color: "text.primary",
																	lineHeight: 1.5,
																	flex: 1,
																}}
															>
																{f.facility.name}
															</Typography>

															{parseFloat(f.fee) > 0 && (
																<Typography
																	variant="caption"
																	fontWeight="700"
																	sx={{
																		color: "primary.main",
																		flexShrink: 0,
																		whiteSpace: "nowrap",
																	}}
																>
																	${f.fee}
																</Typography>
															)}
														</Box>

														{f.note && (
															<Typography
																variant="caption"
																sx={{
																	color: "text.secondary",
																	display: "block",
																	lineHeight: 1.4,
																}}
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

								{/* Location Map */}
								<Paper sx={{ p: 3, mb: 3 }}>
									<Typography variant="h6" fontWeight="bold" gutterBottom>
										Location
									</Typography>
									<Box
										sx={{
											height: 300,
											bgcolor: "#e0e0e0",
											borderRadius: 1,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											mb: 2,
										}}
									>
										<Typography color="text.secondary">Map will be integrated here (Google Maps/Mapbox)</Typography>
									</Box>
									<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
										{accommodation.address.fullAddress}
									</Typography>
								</Paper>
							</>
						)}

						{/* Rooms Tab */}
						{tabValue === 1 && (
							<Box>
								{accommodation.rooms?.map((room) => {
									const availableRooms = 10; // Thay bằng room.availableRooms khi API có data
									const quantity = roomQuantities[room.id] || 0;
									return (
										<Paper
											key={room.id}
											sx={{
												mb: 3,
												borderRadius: 2,
												border: "1px solid",
												borderColor: "divider",
												boxShadow: "none",
												overflow: "hidden",
												transition: "border-color 0.2s",
												"&:hover": {
													borderColor: "primary.main",
												},
											}}
										>
											<Box sx={{ p: 3 }}>
												{/* Header */}
												<Box
													sx={{
														display: "flex",
														justifyContent: "space-between",
														alignItems: "flex-start",
														mb: 2,
														gap: 2,
														flexWrap: "wrap",
													}}
												>
													<Box sx={{ flex: 1 }}>
														<Typography variant="h6" fontWeight="600" sx={{ mb: 0.5 }}>
															{room.name}
														</Typography>
														<Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
															{room.description}
														</Typography>
													</Box>

													{/* Price Badge */}
													<Box
														sx={{
															textAlign: "right",
															minWidth: 120,
														}}
													>
														<Typography variant="caption" color="text.secondary" display="block">
															from
														</Typography>
														<Typography variant="h5" fontWeight="700" color="primary.main">
															${parseFloat(room.price).toFixed(0)}
														</Typography>
														<Typography variant="caption" color="text.secondary">
															per night
														</Typography>
													</Box>
												</Box>

												{/* Room Details */}
												<Box
													sx={{
														display: "flex",
														flexWrap: "wrap",
														gap: 3,
														py: 2.5,
														borderTop: "1px solid",
														borderBottom: "1px solid",
														borderColor: "divider",
													}}
												>
													<Box
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 1,
														}}
													>
														<Person
															sx={{
																fontSize: 20,
																color: "text.secondary",
															}}
														/>
														<Typography variant="body2" color="text.secondary">
															{room.maxAdults} {room.maxAdults === 1 ? "Adult" : "Adults"}
															{room.maxChildren > 0 && `, ${room.maxChildren} ${room.maxChildren === 1 ? "Child" : "Children"}`}
														</Typography>
													</Box>

													<Box
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 1,
														}}
													>
														<Hotel
															sx={{
																fontSize: 20,
																color: "text.secondary",
															}}
														/>
														<Typography variant="body2" color="text.secondary">
															{room.beds.length} {room.beds.length === 1 ? "bed" : "beds"} ({room.beds[0]?.bedType})
														</Typography>
													</Box>

													<Box
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 1,
														}}
													>
														<SquareFoot
															sx={{
																fontSize: 20,
																color: "text.secondary",
															}}
														/>
														<Typography variant="body2" color="text.secondary">
															{room.size} m²
														</Typography>
													</Box>

													<Box
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 1,
														}}
													>
														<Bathtub
															sx={{
																fontSize: 20,
																color: "text.secondary",
															}}
														/>
														<Typography variant="body2" color="text.secondary">
															{room.bathroomCount} {room.bathroomCount === 1 ? "Bathroom" : "Bathrooms"}
														</Typography>
													</Box>

													{room.viewType && (
														<Box
															sx={{
																display: "flex",
																alignItems: "center",
																gap: 1,
															}}
														>
															<Visibility
																sx={{
																	fontSize: 20,
																	color: "text.secondary",
																}}
															/>
															<Typography variant="body2" color="text.secondary">
																{room.viewType} view
															</Typography>
														</Box>
													)}
												</Box>

												{/* Bottom Section: Amenities + Quantity Control */}
												<Box
													sx={{
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
														gap: 3,
														mt: 2.5,
														flexWrap: "wrap",
													}}
												>
													{/* Amenities */}
													<Box sx={{ flex: 1, minWidth: 300 }}>
														{room.amenities.length > 0 && (
															<Box
																sx={{
																	display: "flex",
																	flexWrap: "wrap",
																	gap: 1,
																}}
															>
																{room.amenities.slice(0, 5).map((a) => (
																	<Box
																		key={a.id}
																		sx={{
																			px: 1.5,
																			py: 0.5,
																			borderRadius: 1,
																			backgroundColor: "grey.50",
																			border: "1px solid",
																			borderColor: "grey.200",
																		}}
																	>
																		<Typography
																			variant="caption"
																			sx={{
																				color: "text.secondary",
																				fontWeight: 500,
																			}}
																		>
																			{a.amenity.name}
																		</Typography>
																	</Box>
																))}
																{room.amenities.length > 5 && (
																	<Box
																		sx={{
																			px: 1.5,
																			py: 0.5,
																			borderRadius: 1,
																			backgroundColor: "grey.50",
																			border: "1px solid",
																			borderColor: "grey.200",
																		}}
																	>
																		<Typography
																			variant="caption"
																			sx={{
																				color: "text.secondary",
																				fontWeight: 500,
																			}}
																		>
																			+{room.amenities.length - 5} more
																		</Typography>
																	</Box>
																)}
															</Box>
														)}
													</Box>

													{/* Quantity Control & Availability */}
													<Box
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 2,
														}}
													>
														{/* Available Rooms */}
														<Typography
															variant="body2"
															sx={{
																color: availableRooms <= 3 ? "error.main" : "success.main",
																fontWeight: 500,
															}}
														>
															{availableRooms} left
														</Typography>

														{/* Quantity Buttons */}
														<Box
															sx={{
																display: "flex",
																alignItems: "center",
																gap: 1,
															}}
														>
															<IconButton
																size="small"
																onClick={() => handleDecrease(room.id)}
																disabled={quantity === 0}
																sx={{
																	border: "1px solid",
																	borderColor: "divider",
																	borderRadius: 1,
																	"&:hover": {
																		borderColor: "primary.main",
																		backgroundColor: "primary.lighter",
																	},
																	"&.Mui-disabled": {
																		borderColor: "action.disabled",
																	},
																}}
															>
																<Remove fontSize="small" />
															</IconButton>

															<Typography
																variant="body1"
																fontWeight="600"
																sx={{
																	minWidth: 32,
																	textAlign: "center",
																}}
															>
																{quantity}
															</Typography>

															<IconButton
																size="small"
																onClick={() => handleIncrease(room.id, availableRooms)}
																disabled={quantity >= availableRooms}
																sx={{
																	border: "1px solid",
																	borderColor: "primary.main",
																	borderRadius: 1,
																	color: "primary.main",
																	"&:hover": {
																		backgroundColor: "primary.lighter",
																	},
																	"&.Mui-disabled": {
																		borderColor: "action.disabled",
																		color: "action.disabled",
																	},
																}}
															>
																<Add fontSize="small" />
															</IconButton>
														</Box>
													</Box>
												</Box>
											</Box>
										</Paper>
									);
								})}
							</Box>
						)}

						{/* Reviews Tab - Using Mock Data */}
						{tabValue === 2 && (
							<Paper sx={{ p: 3 }}>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										mb: 3,
									}}
								>
									<Typography variant="h6" fontWeight="bold">
										Guest Reviews
									</Typography>
									<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
										<Star sx={{ color: "#ffa726" }} />
										<Typography variant="h6" fontWeight="bold">
											{mockAverageRating}
										</Typography>
										<Typography variant="body2" color="text.secondary">
											({mockNumberOfReviews} reviews)
										</Typography>
									</Box>
								</Box>
								<Divider sx={{ mb: 3 }} />
								{/* TODO: Replace with real reviews from API */}
								<Stack spacing={3}>
									{mockReviews.map((review) => (
										<Box key={review.id}>
											<Box sx={{ display: "flex", gap: 2, mb: 1 }}>
												<Avatar sx={{ bgcolor: "primary.main" }}>{review.userName.charAt(0).toUpperCase()}</Avatar>
												<Box sx={{ flex: 1 }}>
													<Box
														sx={{
															display: "flex",
															justifyContent: "space-between",
															alignItems: "start",
														}}
													>
														<Box>
															<Typography variant="subtitle2" fontWeight="bold">
																{review.userName}
															</Typography>
															<Rating value={review.star} readOnly size="small" />
														</Box>
														<Typography variant="caption" color="text.secondary">
															{new Date(review.createdAt).toLocaleDateString()}
														</Typography>
													</Box>
													<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
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
						<Paper sx={{ p: 3, position: "sticky", top: 16, boxShadow: 3 }}>
							<Typography variant="h6" fontWeight="bold" gutterBottom>
								Book Your Stay
							</Typography>
							<Box sx={{ mb: 2 }}>
								<Typography variant="caption" color="text.secondary">
									Total for {nights} {nights === 1 ? "night" : "nights"}
								</Typography>
								<Typography variant="h4" fontWeight="bold" color="primary">
									${totalPrice.toFixed(0)}
								</Typography>
							</Box>
							<Divider sx={{ my: 2 }} />
							<Stack spacing={2}>
								<TextField
									label="Check-in"
									type="date"
									fullWidth
									InputLabelProps={{ shrink: true }}
									value={startDate.toISOString().split("T")[0]}
									onChange={(e) => setStartDate(new Date(e.target.value))}
								/>
								<TextField
									label="Check-out"
									type="date"
									fullWidth
									InputLabelProps={{ shrink: true }}
									value={endDate.toISOString().split("T")[0]}
									onChange={(e) => setEndDate(new Date(e.target.value))}
								/>
								<Button variant="contained" size="large" fullWidth>
									Reserve Now
								</Button>
							</Stack>
							<Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2, textAlign: "center" }}>
								✓ Free cancellation available
							</Typography>
							<Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
								✓ No payment needed today
							</Typography>
						</Paper>
					</Grid>
				</Grid>
			</Container>

			{/* Image Gallery Dialog */}
			<Dialog open={openGallery} onClose={() => setOpenGallery(false)} maxWidth="lg" fullWidth>
				<Box sx={{ position: "relative", p: 2, bgcolor: "#000" }}>
					<IconButton
						sx={{
							position: "absolute",
							top: 8,
							right: 8,
							zIndex: 1,
							bgcolor: "white",
						}}
						onClick={() => setOpenGallery(false)}
					>
						<Close />
					</IconButton>
					<Typography variant="h6" color="white" sx={{ mb: 2, pl: 1 }}>
						{accommodation?.name}
					</Typography>
					<ImageList cols={2} gap={8}>
						{displayImages.length > 0 &&
							displayImages.map((img) =>
								img && img.url ? (
									<ImageListItem key={img.id}>
										<img src={img.url} alt={accommodation?.name || "Image"} loading="lazy" style={{ borderRadius: 8 }} />
									</ImageListItem>
								) : null
							)}
					</ImageList>
				</Box>
			</Dialog>
		</Box>
	);
};

export default AccommodationDetailPage;
