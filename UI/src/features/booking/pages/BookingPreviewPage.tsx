import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Grid, Paper, Divider } from "@mui/material";
import { PreviewOutlined } from "@mui/icons-material";
import { useBookingContext } from "../hooks/useBookingContext";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";
import UserInfoPreviewCard from "../components/UserInfoPreviewCard";
import RoomReviewBox from "../components/RoomReviewBox";
import AccommodationInfoBox from "../components/AccommodationInfoBox";
import type { ImageType } from "../services/types/Image";

const ImageGallery = lazy(() => import("../components/ImageGallery"));

export default function BookingPreviewPage() {
	const navigate = useNavigate();
	const { booking, setBooking } = useBookingContext();
	const { pushNotification } = usePushNotificationContext();

	// MUITelInput + checkbox
	const [isEditing, setIsEditing] = useState(false);
	const [showPhoneField, setShowPhoneField] = useState(true);
	const [agreed, setAgreed] = useState(false);

	// Image gallery
	const [openGallery, setOpenGallery] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [galleryImages, setGalleryImages] = useState<ImageType[]>([]);

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

	return (
		<Box sx={{ mx: "auto", mt: 5, px: 3, maxWidth: 1400 }}>
			<Paper
				elevation={2}
				sx={{
					p: 3,
					mb: 4,
					borderRadius: 2,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
					<PreviewOutlined color="primary" sx={{ fontSize: 32 }} />
					<Typography variant="h4">Booking Preview</Typography>
				</Box>
				<Divider />
			</Paper>

			<Grid container spacing={3} sx={{ justifyContent: "center" }}>
				{/* LEFT COLUMN */}
				<Grid size={{ xs: 12, md: 4 }}>
					<UserInfoPreviewCard booking={booking} isEditing={isEditing} showPhoneField={showPhoneField} handleToggleEdit={handleToggleEdit} handlePhoneChange={handlePhoneChange} />
				</Grid>

				{/* MIDDLE COLUMN */}
				<Grid size={{ xs: 12, md: 4 }}>
					<RoomReviewBox booking={booking} setGalleryImages={setGalleryImages} openImageGallery={openImageGallery} />
				</Grid>

				{/* RIGHT COLUMN */}
				<Grid size={{ xs: 12, md: 4 }}>
					<AccommodationInfoBox
						booking={booking}
						agreed={agreed}
						setAgreed={setAgreed}
						setGalleryImages={setGalleryImages}
						openImageGallery={openImageGallery}
						handleProceed={handleProceed}
					/>
				</Grid>
			</Grid>

			{/* FULLSCREEN GALLERY */}
			{openGallery && (
				<Suspense fallback={<div>Loading gallery...</div>}>
					<ImageGallery
						galleryImages={galleryImages}
						openGallery={openGallery}
						currentIndex={currentIndex}
						setCurrentIndex={setCurrentIndex}
						closeGallery={closeGallery}
						handlePrevImage={handlePrevImage}
						handleNextImage={handleNextImage}
					/>
				</Suspense>
			)}
		</Box>
	);
}
