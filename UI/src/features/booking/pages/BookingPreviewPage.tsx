import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, Button, Checkbox, Divider, Dialog, IconButton, Grid } from "@mui/material";
import { ChevronLeft, ChevronRight, Close } from "@mui/icons-material";
import { MuiTelInput } from "mui-tel-input";
import { useBookingContext } from "../hooks/useBookingContext";
import { useFetchImages } from "../hooks/useFetchImages";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";

export default function BookingPreviewPage() {
	const navigate = useNavigate();
	const { booking, setBooking } = useBookingContext();
	const { getImages } = useFetchImages();
	const { pushNotification } = usePushNotificationContext();

	// Images
	const [roomImages, setRoomImages] = useState<Record<string, string>>({});
	const [roomImagesByRoomId, setRoomImagesByRoomId] = useState<Record<string, string[]>>({});
	const [imagesLoading, setImagesLoading] = useState(true);
	const [accomImages, setAccomImages] = useState<string[]>([]);
	const [accomImageLoading, setAccomImageLoading] = useState(true);

	// MUITelInput + checkbox
	const [isEditing, setIsEditing] = useState(false);
	const [showPhoneField, setShowPhoneField] = useState(true);
	const [agreed, setAgreed] = useState(false);

	// Image gallery
	const [openGallery, setOpenGallery] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [galleryImages, setGalleryImages] = useState<string[]>([]);

	const openImageGallery = (index: number) => {
		const safeIndex = Math.min(Math.max(0, index), galleryImages.length);
		setCurrentIndex(safeIndex);
		setOpenGallery(true);
	};

	const closeGallery = () => setOpenGallery(false);

	const handlePrevImage = () => {
		setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
	};

	const handleNextImage = () => {
		setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
	};

	const handlePhoneChange = (value: string) =>
		setBooking({
			...booking,
			user: { ...booking.user, phone: value },
		});

	const handleToggleEdit = () => {
		if (isEditing) {
			const phone = booking.user.phone.trim();
			if (phone && !/^[0-9]+$/.test(phone)) {
				pushNotification("Please enter a valid phone number (numbers only).", "warning");
				return;
			}
			setShowPhoneField(!!phone);
		}
		setIsEditing((prev) => !prev);
	};

	const handleProceed = () => {
		if (!booking.user.name.trim()) {
			return pushNotification("Name cannot be empty.", "error");
		}

		if (!agreed) {
			return pushNotification("Please confirm that all the information is correct.", "warning");
		}

		navigate("/booking/checkout", { state: { booking } });
	};

	// Fetch ROOM images
	const fetchedRef = useRef(false);
	useEffect(() => {
		if (!booking?.room?.length || fetchedRef.current) return;

		fetchedRef.current = true;

		const loadRoomImages = async () => {
			try {
				const imageMap: Record<string, string> = {};
				const imagesByRoom: Record<string, string[]> = {};

				await Promise.all(
					booking.room.map(async (room) => {
						try {
							const res = await getImages({
								entity: "room",
								id: room.id,
							});

							const webpImages = res.filter((img: any) => img.variant === "WEBP").map((img: any) => img.url);

							if (webpImages.length > 0) {
								imageMap[room.id] = webpImages[0]; // First image for thumbnail
								imagesByRoom[room.id] = webpImages; // All images for this specific room
							}
						} catch (err) {
							console.error(`Error fetching images for room ${room.id}:`, err);
						}
					})
				);

				setRoomImages(imageMap);
				setRoomImagesByRoomId(imagesByRoom);

				if (Object.keys(imageMap).length > 0) {
					pushNotification("Room images loaded successfully", "success");
				} else {
					pushNotification("No images available for rooms", "info");
				}
			} catch (err) {
				console.error("Error fetching room images:", err);
				pushNotification("Failed to load room images", "error");
			} finally {
				setImagesLoading(false);
			}
		};

		loadRoomImages();
	}, []);

	// Fetch ACCOMMODATION images
	const fetchedAccomRef = useRef(false);
	useEffect(() => {
		if (!booking?.room?.length || fetchedAccomRef.current) return;

		fetchedAccomRef.current = true;

		const loadAccomImages = async () => {
			try {
				const res = await getImages({
					entity: "accommodation",
					id: booking.room[0].id,
				});

				const webpImages = res.filter((img: any) => img.variant === "WEBP").map((img: any) => img.url);

				setAccomImages(webpImages);
			} catch (err) {
				console.error("Error fetching accommodation images:", err);
			} finally {
				setAccomImageLoading(false);
			}
		};

		loadAccomImages();
	}, []);

	// Gallery keyboard support
	useEffect(() => {
		if (!openGallery) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft") handlePrevImage();
			if (e.key === "ArrowRight") handleNextImage();
			if (e.key === "Escape") closeGallery();
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [openGallery, galleryImages.length]);

	// Total price
	const totalPrice = booking.room.reduce((sum, room) => sum + (room.price || 0), 0);

	return (
		<Box sx={{ maxWidth: 1400, mx: "auto", mt: 5, px: 3 }}>
			<Typography variant="h4" gutterBottom mb={3}>
				Booking Preview
			</Typography>

			<Grid container spacing={3}>
				{/* LEFT COLUMN - User */}
				<Grid item xs={12} md={3}>
					<Card>
						<CardContent>
							<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
								<Typography variant="h6">User Information</Typography>
								<Button size="small" onClick={handleToggleEdit} sx={{ color: "warning.main" }}>
									{isEditing ? "Done" : "Edit"}
								</Button>
							</Box>

							<Typography sx={{ mb: 1 }}>
								<strong>Name:</strong> {booking.user.name}
							</Typography>
							<Typography sx={{ mb: 1 }}>
								<strong>Email:</strong> {booking.user.email}
							</Typography>

							<Box minHeight={56} display="flex" alignItems="center">
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
				</Grid>

				{/* MIDDLE COLUMN - Room Review */}
				<Grid item xs={12} md={6}>
					<Card>
						<CardContent>
							<Typography variant="h6" mb={2}>
								Room Review
							</Typography>

							{booking.room.map((room, idx) => (
								<Box key={room.id} mb={idx < booking.room.length - 1 ? 3 : 0}>
									<Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2 }}>
										<Box display="flex" gap={2}>
											{/* Room Image */}
											<Box
												sx={{
													width: 120,
													height: 120,
													bgcolor: "#90EE90",
													borderRadius: 2,
													flexShrink: 0,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													overflow: "hidden",
												}}
											>
												{imagesLoading ? (
													<Typography variant="caption" color="text.secondary">
														Loading...
													</Typography>
												) : roomImages[room.id] ? (
													<Box
														component="img"
														src={roomImages[room.id]}
														alt={room.name}
														onClick={() => {
															// Set only THIS room's images to gallery
															const thisRoomImages = roomImagesByRoomId[room.id] || [];
															setGalleryImages(thisRoomImages);
															// Open at first image
															setTimeout(() => openImageGallery(0), 0);
														}}
														sx={{
															width: "100%",
															height: "100%",
															objectFit: "cover",
															cursor: "pointer",
														}}
													/>
												) : (
													<Typography variant="caption" color="text.secondary">
														No Image
													</Typography>
												)}
											</Box>

											{/* Room Details */}
											<Box flex={1} display="flex" flexDirection="column" justifyContent="space-between">
												<Box>
													<Typography variant="subtitle1" fontWeight={600} mb={0.5}>
														{room.name}
													</Typography>
													<Typography variant="body2" color="text.secondary">
														Type of place: {room.type.toLowerCase()}
													</Typography>
												</Box>
												<Typography variant="h6" sx={{ color: "warning.main" }} textAlign="right">
													${room.price || 0}
												</Typography>
											</Box>
										</Box>
									</Box>
								</Box>
							))}
						</CardContent>
					</Card>
				</Grid>

				{/* RIGHT COLUMN - Accommodation Info */}
				<Grid item xs={12} md={3}>
					<Card>
						<CardContent>
							<Typography variant="h6" mb={2}>
								Accommodation Information
							</Typography>

							{/* Accommodation Image Gallery Preview */}
							{accomImages.length > 0 && (
								<Box sx={{ mb: 2 }}>
									{/* Main Image */}
									<Box
										component="img"
										src={accomImages[0]}
										alt={booking.accommodation.name}
										onClick={() => {
											setGalleryImages(accomImages);
											setTimeout(() => openImageGallery(0), 0);
										}}
										sx={{
											width: "100%",
											height: 150,
											objectFit: "cover",
											borderRadius: 2,
											cursor: "pointer",
											mb: 1,
										}}
									/>

									{/* Thumbnail Grid (if more than 1 image) */}
									{accomImages.length > 1 && (
										<Box
											sx={{
												display: "grid",
												gridTemplateColumns: "repeat(4, 1fr)",
												gap: 0.5,
												position: "relative",
											}}
										>
											{accomImages.slice(1, 5).map((img, idx) => (
												<Box
													key={idx}
													component="img"
													src={img}
													alt={`Accommodation ${idx + 2}`}
													onClick={() => {
														setGalleryImages(accomImages);
														setTimeout(() => openImageGallery(idx + 1), 0);
													}}
													sx={{
														width: "100%",
														height: 60,
														objectFit: "cover",
														borderRadius: 1,
														cursor: "pointer",
													}}
												/>
											))}
											{/* Show +N overlay on last thumbnail if more images exist */}
											{accomImages.length > 5 && (
												<Box
													sx={{
														position: "absolute",
														bottom: 0,
														right: 0,
														width: "calc(25% - 2px)",
														height: 60,
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														bgcolor: "rgba(0,0,0,0.6)",
														color: "white",
														borderRadius: 1,
														cursor: "pointer",
														fontWeight: 600,
													}}
													onClick={() => {
														setGalleryImages(accomImages);
														setTimeout(() => openImageGallery(4), 0);
													}}
												>
													+{accomImages.length - 4}
												</Box>
											)}
										</Box>
									)}
								</Box>
							)}

							{/* Loading/No Image State */}
							{accomImages.length === 0 && (
								<Box
									sx={{
										width: "100%",
										height: 150,
										bgcolor: "#f0f0f0",
										borderRadius: 2,
										mb: 2,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									{accomImageLoading ? (
										<Typography variant="caption" color="text.secondary">
											Loading...
										</Typography>
									) : (
										<Typography variant="caption" color="text.secondary">
											No Image
										</Typography>
									)}
								</Box>
							)}

							<Typography fontWeight={600} mb={0.5}>
								{booking.accommodation.name}
							</Typography>
							<Typography variant="body2" color="text.secondary" mb={2}>
								{booking.accommodation.address}
							</Typography>

							<Divider sx={{ my: 2 }} />

							<Typography variant="h6" mb={2}>
								Check-in / Checkout Date
							</Typography>
							<Typography variant="body2" mb={1}>
								<strong>Check-in:</strong> {booking.startDate.toDateString()}
							</Typography>
							<Typography variant="body2" mb={1}>
								<strong>Check-out:</strong> {booking.endDate.toDateString()}
							</Typography>
							<Typography variant="body2" mb={3}>
								<strong>Guests:</strong> {booking.guestCount}
							</Typography>

							<Divider sx={{ my: 2 }} />

							<Box mb={3}>
								<Typography variant="h6" mb={1}>
									Total Price
								</Typography>
								<Typography variant="h4" sx={{ color: "warning.main" }} fontWeight={600}>
									${totalPrice}
								</Typography>
							</Box>

							<Box display="flex" alignItems="flex-start" gap={1} mb={2}>
								<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} sx={{ p: 0, mt: 0.25 }} />
								<Typography variant="body2" sx={{ lineHeight: 1.6 }}>
									I confirm that all the information I provided is correct.
								</Typography>
							</Box>

							<Button
								variant="contained"
								fullWidth
								sx={{
									py: 1.5,
									bgcolor: "warning.main",
									"&:hover": { bgcolor: "warning.dark" },
								}}
								onClick={handleProceed}
							>
								Proceed to Payment
							</Button>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			{/* FULLSCREEN GALLERY */}
			<Dialog
				fullScreen
				open={openGallery}
				onClose={closeGallery}
				slotProps={{
					backdrop: {
						sx: {
							backdropFilter: "blur(8px)",
							backgroundColor: "rgba(0, 0, 0, 0.85)",
						},
					},
				}}
				PaperProps={{
					sx: {
						backgroundColor: "transparent",
						boxShadow: "none",
					},
				}}
			>
				<Box sx={{ position: "relative", height: "100vh" }} onClick={closeGallery}>
					{/* Close Button */}
					<IconButton
						onClick={(e) => {
							e.stopPropagation();
							closeGallery();
						}}
						sx={{
							position: "absolute",
							top: 20,
							right: 20,
							zIndex: 9999,
							color: "white",
							bgcolor: "rgba(0,0,0,0.5)",
							"&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
						}}
					>
						<Close />
					</IconButton>

					{/* Image Counter */}
					<Box
						onClick={(e) => e.stopPropagation()}
						sx={{
							position: "absolute",
							top: 20,
							left: "50%",
							transform: "translateX(-50%)",
							zIndex: 9999,
							color: "white",
							bgcolor: "rgba(0,0,0,0.5)",
							px: 2,
							py: 1,
							borderRadius: 1,
						}}
					>
						{currentIndex + 1} / {galleryImages.length}
					</Box>

					{galleryImages.length === 0 ? (
						<Box
							sx={{
								height: "100vh",
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								color: "white",
								fontSize: 18,
							}}
						>
							No images available
						</Box>
					) : (
						<>
							{/* Main Image */}
							<Box
								sx={{
									height: "100vh",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									px: 8,
								}}
							>
								<Box
									component="img"
									src={galleryImages[currentIndex]}
									alt={`Image ${currentIndex + 1}`}
									onClick={(e) => e.stopPropagation()}
									sx={{
										maxWidth: "100%",
										maxHeight: "100%",
										objectFit: "contain",
										cursor: "default",
									}}
								/>
							</Box>

							{/* Left Arrow */}
							<IconButton
								onClick={(e) => {
									e.stopPropagation();
									handlePrevImage();
								}}
								sx={{
									position: "absolute",
									left: 20,
									top: "50%",
									transform: "translateY(-50%)",
									color: "white",
									bgcolor: "rgba(0,0,0,0.5)",
									"&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
									width: 56,
									height: 56,
								}}
							>
								<ChevronLeft sx={{ fontSize: 40 }} />
							</IconButton>

							{/* Right Arrow */}
							<IconButton
								onClick={(e) => {
									e.stopPropagation();
									handleNextImage();
								}}
								sx={{
									position: "absolute",
									right: 20,
									top: "50%",
									transform: "translateY(-50%)",
									color: "white",
									bgcolor: "rgba(0,0,0,0.5)",
									"&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
									width: 56,
									height: 56,
								}}
							>
								<ChevronRight sx={{ fontSize: 40 }} />
							</IconButton>

							{/* Thumbnails */}
							<Box
								onClick={(e) => e.stopPropagation()}
								sx={{
									position: "absolute",
									bottom: 20,
									left: "50%",
									transform: "translateX(-50%)",
									display: "flex",
									gap: 1,
									maxWidth: "90%",
									overflowX: "auto",
									px: 2,
									"&::-webkit-scrollbar": {
										height: 6,
									},
									"&::-webkit-scrollbar-thumb": {
										bgcolor: "rgba(255,255,255,0.3)",
										borderRadius: 3,
									},
								}}
							>
								{galleryImages.map((url, idx) => (
									<Box
										key={idx}
										component="img"
										src={url}
										alt={`Thumbnail ${idx + 1}`}
										onClick={() => setCurrentIndex(idx)}
										sx={{
											width: 80,
											height: 60,
											objectFit: "cover",
											borderRadius: 1,
											cursor: "pointer",
											border: currentIndex === idx ? "3px solid white" : "3px solid transparent",
											opacity: currentIndex === idx ? 1 : 0.6,
											transition: "all 0.2s",
											"&:hover": { opacity: 1 },
										}}
									/>
								))}
							</Box>
						</>
					)}
				</Box>
			</Dialog>
		</Box>
	);
}
