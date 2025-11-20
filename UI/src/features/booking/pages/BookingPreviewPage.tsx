import { useState, useEffect, lazy, Suspense, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Grid, Paper, Divider } from "@mui/material";
import { PreviewOutlined } from "@mui/icons-material";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";
import UserInfoPreviewCard from "../components/UserInfoPreviewCard";
import RoomReviewBox from "../components/RoomReviewBox";
import AccommodationInfoBox from "../components/AccommodationInfoBox";
import type { ImageType } from "../../../types/Image";
import useRoomsInfo from "../hooks/useRoomInfo";
import useAccommodationInfo from "../hooks/useAccommodationInfo";
import type { UserInfo } from "../types/UserInfo";
import useBookingContextProvider from "../../../context/BookingContext/hook";
const ImageGallery = lazy(() => import("../components/ImageGallery"));

export default function BookingPreviewPage() {
	const navigate = useNavigate();
	const { bookingInfo, updateBookingInfo } = useBookingContextProvider();
	const roomIds = useMemo(() => bookingInfo.items.map((i) => i.id), [bookingInfo.items]);
	const { roomsInfo: selectedRooms, loading: roomInfoLoading } = useRoomsInfo(roomIds);
	const { accommInfo } = useAccommodationInfo(bookingInfo.accommodationId);

	const { pushNotification } = usePushNotificationContext();

	// MUITelInput + checkbox
	const [isEditing, setIsEditing] = useState(false);
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

	const handlePrevImage = useCallback(() => {
		setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
	}, [galleryImages.length]);

	const handleNextImage = useCallback(() => {
		setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
	}, [galleryImages.length]);

	const handleUserInfoUpdate = (field: keyof UserInfo, value: string) => {
		updateBookingInfo("leader", { ...bookingInfo.leader, [field]: value });
	};

	const handleToggleEdit = () => {
		setIsEditing((prev) => !prev);
	};

	const handleProceed = () => {
		if (!bookingInfo.leader.name.trim()) {
			return pushNotification("Name cannot be empty.", "error");
		}

		if (!agreed) {
			return pushNotification("Please confirm that all the information is correct.", "warning");
		}

		navigate("/booking/checkout", { state: { accommodation: accommInfo, rooms: selectedRooms } });
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
	}, [openGallery, galleryImages.length, handleNextImage, handlePrevImage]);

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
				<Grid container spacing={3} sx={{ justifyContent: "center", mt: 3 }}>
					{/* LEFT COLUMN */}
					<Grid size={{ xs: 12, md: 3 }}>
						<UserInfoPreviewCard //
							userInfo={bookingInfo.leader}
							isEditing={isEditing}
							handleToggleEdit={handleToggleEdit}
							handleUserInfoUpdate={handleUserInfoUpdate}
						/>
					</Grid>

					{/* MIDDLE COLUMN */}
					<Grid size={{ xs: 12, md: 5 }}>
						{roomInfoLoading ? (
							<Typography>Loading...</Typography>
						) : (
							<RoomReviewBox //
								roomsInfo={selectedRooms}
								setGalleryImages={setGalleryImages}
								openImageGallery={openImageGallery}
							/>
						)}
					</Grid>

					{/* RIGHT COLUMN */}
					<Grid size={{ xs: 12, md: 4 }}>
						<AccommodationInfoBox
							accommInfo={accommInfo!}
							rooms={selectedRooms}
							agreed={agreed}
							setAgreed={setAgreed}
							setGalleryImages={setGalleryImages}
							openImageGallery={openImageGallery}
							handleProceed={handleProceed}
						/>
					</Grid>
				</Grid>
			</Paper>

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
