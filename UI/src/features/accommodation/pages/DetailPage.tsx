import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Grid, Box, CircularProgress, Typography } from "@mui/material";

import { useAccommodationDetail } from "../hooks/useAccommodationDetail";
import { HeroGallery, PropertyHeader, DetailTabs, BookingCard } from "../components/detail";
import useBookingContextProvider from "../../../context/BookingContext/hook";
import ImageGallery from "../../../components/shared/ImageGallery";

export default function DetailPage() {
	const navigate = useNavigate();
	const { accommodationId } = useParams<{ accommodationId: string }>();
	const { accommodation, loading, error, thumbnails, displayImages } = useAccommodationDetail(accommodationId);

	const [tabValue, setTabValue] = useState(0);

	const { bookingInfo, updateBookingInfo } = useBookingContextProvider();

	useEffect(() => {
		console.log("[DetailPage] effect triggered");
		if (!accommodationId) {
			navigate("/");
			return;
		}

		updateBookingInfo("accommodationId", accommodationId);
	}, [accommodationId, updateBookingInfo, navigate]);

	const [openGallery, setOpenGallery] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);

	const openImageGallery = (index: number) => {
		const safeIndex = Math.min(Math.max(0, index), displayImages.length);
		setCurrentIndex(safeIndex);
		setOpenGallery(true);
	};

	const closeGallery = () => setOpenGallery(false);

	const handlePrevImage = () => {
		setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
	};

	const handleNextImage = () => {
		setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
	};

	const handleUpdateStartDate = (newDate: Date) => {
		updateBookingInfo("startDate", newDate);
	};

	const handleUpdateEndDate = (newDate: Date) => {
		updateBookingInfo("endDate", newDate);
	};

	// Tính số đêm
	const nights = Math.max(0, Math.ceil((bookingInfo.endDate.getTime() - bookingInfo.startDate.getTime()) / (1000 * 60 * 60 * 24)));

	// Tính tổng tiền – type-safe và tối ưu bằng useMemo
	const totalPrice = useMemo(() => {
		if (!accommodation) return 0;

		return bookingInfo.items.reduce((sum, item) => {
			const room = accommodation.rooms.find((r) => r.id === item.id);
			if (!room) return sum;
			return sum + item.count * parseFloat(room.price) * nights;
		}, 0);
	}, [accommodation, bookingInfo.items, nights]);

	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "70vh",
				}}
			>
				<CircularProgress size={60} />
			</Box>
		);
	}

	if (error || !accommodation) {
		return (
			<Typography variant="h5" color="error" textAlign="center" sx={{ mt: 8 }}>
				{error || "Accommodation not found"}
			</Typography>
		);
	}

	return (
		<Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", pb: 8 }}>
			<Container maxWidth="lg" sx={{ pt: 2 }}>
				<HeroGallery images={thumbnails} onOpenGallery={(i) => openImageGallery(i)} />

				<Grid container spacing={4} sx={{ mt: 3 }}>
					{/* Cột trái – thông tin chính */}
					<Grid size={{ xs: 12, md: 8 }}>
						<PropertyHeader accommodation={accommodation} />

						<DetailTabs //
							tabValue={tabValue}
							onChange={setTabValue}
							accommodation={accommodation}
						/>
					</Grid>

					{/* Cột phải – booking card sticky */}
					<Grid size={{ xs: 12, md: 4 }}>
						<BookingCard
							rooms={bookingInfo.items}
							nights={nights}
							totalPrice={totalPrice}
							startDate={bookingInfo.startDate}
							endDate={bookingInfo.endDate}
							onStartDateChange={handleUpdateStartDate}
							onEndDateChange={handleUpdateEndDate}
						/>
					</Grid>
				</Grid>
			</Container>

			{/* Gallery modal */}
			<ImageGallery //
				galleryImages={displayImages}
				openGallery={openGallery}
				currentIndex={currentIndex}
				closeGallery={closeGallery}
				setCurrentIndex={setCurrentIndex}
				handleNextImage={handleNextImage}
				handlePrevImage={handlePrevImage}
			/>
		</Box>
	);
}
