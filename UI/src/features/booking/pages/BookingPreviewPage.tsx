import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, Button, Checkbox, FormControlLabel, Snackbar, Alert, Divider, Dialog, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight, Close } from "@mui/icons-material";
import { MuiTelInput } from "mui-tel-input";
import { useBookingContext } from "../hooks/useBookingContext";
import { useFetchImages } from "../hooks/useFetchImages";

export default function BookingPreviewPage() {
	const navigate = useNavigate();
	const { booking, setBooking } = useBookingContext();
	const { getAccomImage } = useFetchImages();

	const [images, setImages] = useState<string[]>([]);
	const [imagesLoading, setImagesLoading] = useState(true);

	const [isEditing, setIsEditing] = useState(false);
	const [showPhoneField, setShowPhoneField] = useState(true);
	const [agreed, setAgreed] = useState(false);

	const [openGallery, setOpenGallery] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);

	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "error" as "error" | "warning" | "success",
	});
	const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

	const validImages = images.filter((url) => typeof url === "string" && url.trim() !== "");

	const openImageGallery = (index: number) => {
		const safeIndex = Math.min(Math.max(0, index), validImages.length - 1);
		setCurrentIndex(safeIndex);
		setOpenGallery(true);
	};

	const closeGallery = () => setOpenGallery(false);

	const handlePrevImage = () => {
		setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
	};

	const handleNextImage = () => {
		setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
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
				setSnackbar({
					open: true,
					message: "Please enter a valid phone number (numbers only).",
					severity: "warning",
				});
				return;
			}
			setShowPhoneField(!!phone);
		}
		setIsEditing((prev) => !prev);
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
				message: "Please confirm that all the information is correct.",
				severity: "warning",
			});
		}

		navigate("/booking/checkout", { state: { booking } });
	};

	// Fetch images before showing gallery
	const fetchedRef = useRef(false);
	useEffect(() => {
		if (!booking?.room?.length || fetchedRef.current) return;

		fetchedRef.current = true;
		const loadImages = async () => {
			try {
				const roomImgs = await Promise.all(
					booking.room.map(async (room) => {
						const res = await getAccomImage({
							entity: "Accommodation",
							id: room.id,
						});
						return res.filter((img: any) => img.variant === "WEBP").map((img: any) => img.url);
					})
				);
				setImages(roomImgs.flat());
			} catch (err) {
				console.error("Error fetching room images:", err);
			} finally {
				setImagesLoading(false);
			}
		};

		loadImages();
	}, [booking.room, getAccomImage]);

	// Keyboard navigation for gallery
	useEffect(() => {
		if (!openGallery) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft") handlePrevImage();
			if (e.key === "ArrowRight") handleNextImage();
			if (e.key === "Escape") closeGallery();
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [openGallery, validImages.length]);

	return (
		<Box sx={{ maxWidth: 600, mx: "auto", mt: 5, px: 2 }}>
			<Typography variant="h4" gutterBottom>
				Booking Preview
			</Typography>

			{/* USER INFO */}
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

			{/* ACCOMMODATION INFO */}
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

					{/* IMAGE PREVIEW GRID */}
					<Box mt={2}>
						{imagesLoading ? (
							<Box
								sx={{
									height: 350,
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									bgcolor: "#f0f0f0",
									borderRadius: 2,
								}}
							>
								<Typography>Loading images...</Typography>
							</Box>
						) : validImages.length === 0 ? (
							<Box
								sx={{
									height: 350,
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									bgcolor: "#f0f0f0",
									borderRadius: 2,
								}}
							>
								<Typography>No images available</Typography>
							</Box>
						) : (
							<Box
								sx={{
									display: "grid",
									gridTemplateColumns: "2fr 1fr",
									gap: 1.5,
									width: "100%",
								}}
							>
								{/* Main image */}
								<Box
									component="img"
									src={validImages[0]}
									alt="Main"
									onClick={() => openImageGallery(0)}
									sx={{
										width: "100%",
										height: 350,
										objectFit: "cover",
										borderRadius: 2,
										cursor: "pointer",
									}}
								/>

								{/* Right stacked images */}
								<Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
									{validImages.slice(1, 4).map((url, idx) => {
										const abs = idx + 1;
										const showOverlay = validImages.length > 4 && idx === 2;

										return (
											<Box
												key={abs}
												onClick={() => openImageGallery(abs)}
												sx={{
													width: "100%",
													height: 110,
													borderRadius: 2,
													overflow: "hidden",
													position: "relative",
													cursor: "pointer",
												}}
											>
												<Box component="img" src={url} alt={`Preview ${abs}`} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
												{showOverlay && (
													<Box
														sx={{
															position: "absolute",
															inset: 0,
															bgcolor: "rgba(0,0,0,0.45)",
															display: "flex",
															alignItems: "center",
															justifyContent: "center",
															color: "white",
															fontSize: 24,
															fontWeight: 600,
														}}
													>
														+{validImages.length - 4}
													</Box>
												)}
											</Box>
										);
									})}
								</Box>
							</Box>
						)}
					</Box>
				</CardContent>
			</Card>

			{/* ROOMS */}
			<Card sx={{ mb: 3 }}>
				<CardContent>
					<Typography variant="h6">Rooms / Beds</Typography>
					<ul style={{ marginTop: 8 }}>
						{booking.room.map((r) => (
							<li key={r.id}>
								{r.name} ({r.type})
							</li>
						))}
					</ul>
				</CardContent>
			</Card>

			{/* CONFIRMATION */}
			<FormControlLabel control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />} label="I confirm that all the information I provided is correct." />

			<Button variant="contained" color="primary" fullWidth sx={{ mt: 2, py: 1.2 }} onClick={handleProceed}>
				Proceed to Payment
			</Button>

			{/* SNACKBAR */}
			<Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
				<Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
					{snackbar.message}
				</Alert>
			</Snackbar>

			{/* FULLSCREEN GALLERY WITH ARROWS */}
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
						{currentIndex + 1} / {validImages.length}
					</Box>

					{imagesLoading ? (
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
							Loading images...
						</Box>
					) : validImages.length === 0 ? (
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
							{/* Main Image Display */}
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
									src={validImages[currentIndex]}
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

							{/* Thumbnail Strip */}
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
								{validImages.map((url, idx) => (
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
