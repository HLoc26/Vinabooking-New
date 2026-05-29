import { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Grid, Paper, Divider } from "@mui/material";
import { PreviewOutlined } from "@mui/icons-material";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";
import UserInfoPreviewCard from "../components/UserInfoPreviewCard";
import RoomReviewBox from "../components/PreviewBooking/RoomReviewBox";
import AccommodationInfoBox from "../components/PreviewBooking/AccommodationInfoBox";
import type { UserInfo } from "../types/UserInfo";
import useRooms from "../../accommodation/hooks/useRooms";
import useAccommodation from "../../accommodation/hooks/useAccommodation";
import usePreviewQuote from "../hooks/usePreviewQuote";
import type { QuoteItemPricing } from "../types/pricing.types";

import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../../app/store";
import { setLeader } from "../bookingSlice";

const ImageGallery = lazy(() => import("../../../components/shared/ImageGallery"));

export default function BookingPreviewPage() {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const bookingInfo = useSelector((state: RootState) => state.booking);

	const roomIds = bookingInfo.items.map((i) => i.id);
	const { data: selectedRooms = [], isLoading: roomInfoLoading } = useRooms(roomIds);
	const { data: accommInfo } = useAccommodation(bookingInfo.accommodationId);
	const { data: quote } = usePreviewQuote({
		startDate: bookingInfo.startDate,
		endDate: bookingInfo.endDate,
		items: bookingInfo.items,
	});

	const pricingByItemId = new Map<string, QuoteItemPricing>();
	quote?.items.forEach((it) => pricingByItemId.set(it.itemId, it.pricing));

	const enrichedRooms = selectedRooms.map((room) => {
		const bookingItem = bookingInfo.items.find((i) => i.id === room.id);

		return {
			...room,
			count: bookingItem?.count ?? 0,
			pricing: pricingByItemId.get(room.id) ?? room.pricing,
		};
	});

	const authUser = useSelector((state: RootState) => state.auth.user);
	useEffect(() => {
		if (authUser && !bookingInfo.leader.email) {
			dispatch(
				setLeader({
					name: authUser.name,
					email: authUser.email,
					phone: authUser.phone ?? "",
				})
			);
		}
	}, [authUser, bookingInfo.leader.email, dispatch]);

	const { pushNotification } = usePushNotificationContext();

	// UI state
	const [isEditing, setIsEditing] = useState(false);
	const [agreed, setAgreed] = useState(false);

	// Image gallery state
	const [openGallery, setOpenGallery] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [galleryImages, setGalleryImages] = useState<string[]>([]);

	const openImageGallery = (index: number) => {
		const safeIndex = Math.min(Math.max(0, index), galleryImages.length - 1);
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

	// Redux version of updating leader
	const handleUserInfoUpdate = (field: keyof UserInfo, value: string) => {
		dispatch(
			setLeader({
				...bookingInfo.leader,
				[field]: value,
			})
		);
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

		navigate("/booking/checkout", {
			state: { accommodation: accommInfo, rooms: selectedRooms },
		});
	};

	// Keyboard support
	useEffect(() => {
		if (!openGallery) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft") handlePrevImage();
			if (e.key === "ArrowRight") handleNextImage();
			if (e.key === "Escape") closeGallery();
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [openGallery, handleNextImage, handlePrevImage]);

	return (
		<Box sx={{ mx: "auto", mt: 5, px: 3, maxWidth: 1400 }}>
			<Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
					<PreviewOutlined color="primary" sx={{ fontSize: 32 }} />
					<Typography variant="h4">Booking Preview</Typography>
				</Box>

				<Divider />

				<Grid container spacing={3} sx={{ justifyContent: "center", mt: 3 }}>
					{/* LEFT */}
					<Grid size={{ xs: 12, md: 3 }}>
						<UserInfoPreviewCard userInfo={bookingInfo.leader} isEditing={isEditing} handleToggleEdit={handleToggleEdit} handleUserInfoUpdate={handleUserInfoUpdate} />
					</Grid>

					{/* MIDDLE */}
					<Grid size={{ xs: 12, md: 5 }}>
						{roomInfoLoading ? <Typography>Loading...</Typography> : <RoomReviewBox roomsInfo={enrichedRooms} nights={quote?.nights} setGalleryImages={setGalleryImages} openImageGallery={openImageGallery} />}
					</Grid>

					{/* RIGHT */}
					<Grid size={{ xs: 12, md: 4 }}>
						<AccommodationInfoBox
							accommInfo={accommInfo!}
							quote={quote}
							agreed={agreed}
							setAgreed={setAgreed}
							setGalleryImages={setGalleryImages}
							openImageGallery={openImageGallery}
							handleProceed={handleProceed}
						/>
					</Grid>
				</Grid>
			</Paper>

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
