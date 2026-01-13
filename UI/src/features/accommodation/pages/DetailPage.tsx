import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Container, Grid, Box, CircularProgress, Typography } from "@mui/material";

import { useAccommodationDetail } from "../hooks/useAccommodationDetail";
import { HeroGallery, PropertyHeader, DetailTabs, BookingCard } from "../components/detail";
import useBookingContextProvider from "../../../context/BookingContext/hook";
import useSearchContext from "../../../context/SearchContext/hook";
import ImageGallery from "../../../components/shared/ImageGallery";
import { useAccommodationReview } from "../hooks/useAccommodationReview";

// Helper format date YYYY-MM-DD
const formatDateParam = (date: Date) => date.toLocaleDateString("sv-SE");

export default function DetailPage() {
	const navigate = useNavigate();
	const { accommodationId } = useParams<{ accommodationId: string }>();
	const [searchParams, setSearchParams] = useSearchParams();

	const { bookingInfo, updateBookingInfo } = useBookingContextProvider();
	const { searchCriteria } = useSearchContext();

	const { accommodation, loading, error, thumbnails, displayImages } = useAccommodationDetail(accommodationId, bookingInfo.startDate, bookingInfo.endDate);
	const { reviews } = useAccommodationReview(accommodation?.id ?? "");

	const avgStar = reviews.reduce((sum, a) => sum + (a.star ?? 0), 0) / (reviews.filter((r) => typeof r.star === "number").length || 1);

	const [tabValue, setTabValue] = useState(0);
	const [openGallery, setOpenGallery] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		console.log("[DetailPage] Syncing URL params to Context");

		if (!accommodationId) {
			navigate("/");
			return;
		}

		updateBookingInfo("accommodationId", accommodationId);

		const urlCheckIn = searchParams.get("checkIn");
		const urlCheckOut = searchParams.get("checkOut");

		let finalCheckIn: Date;
		let finalCheckOut: Date;
		let shouldUpdateUrl = false;

		if (urlCheckIn && urlCheckOut) {
			finalCheckIn = new Date(urlCheckIn);
			finalCheckOut = new Date(urlCheckOut);
			if (finalCheckOut <= finalCheckIn) {
				// Tự động set Check-out = Check-in + 1 ngày
				const correctedCheckOut = new Date(finalCheckIn);
				correctedCheckOut.setDate(correctedCheckOut.getDate() + 1);

				finalCheckOut = correctedCheckOut;
				shouldUpdateUrl = true; // Cờ này bật lên để trigger cập nhật URL ở đoạn code dưới
			}
		} else {
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);

			const dayAfter = new Date();
			dayAfter.setDate(dayAfter.getDate() + 2);

			finalCheckIn = searchCriteria.dates.checkIn || tomorrow;
			finalCheckOut = searchCriteria.dates.checkOut || dayAfter;

			shouldUpdateUrl = true;
		}

		if (finalCheckIn.getTime() !== bookingInfo.startDate.getTime()) {
			updateBookingInfo("startDate", finalCheckIn);
		}
		if (finalCheckOut.getTime() !== bookingInfo.endDate.getTime()) {
			updateBookingInfo("endDate", finalCheckOut);
		}

		if (shouldUpdateUrl) {
			const newParams = new URLSearchParams(searchParams);
			newParams.set("checkIn", formatDateParam(finalCheckIn));
			newParams.set("checkOut", formatDateParam(finalCheckOut));
			setSearchParams(newParams, { replace: true });
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [accommodationId, navigate, searchCriteria]);

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
		const newParams = new URLSearchParams(searchParams);
		newParams.set("checkIn", formatDateParam(newDate));
		setSearchParams(newParams);
	};

	const handleUpdateEndDate = (newDate: Date) => {
		updateBookingInfo("endDate", newDate);
		const newParams = new URLSearchParams(searchParams);
		newParams.set("checkOut", formatDateParam(newDate));
		setSearchParams(newParams);
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
						<PropertyHeader accommodation={accommodation} averageRating={avgStar} reviewCount={reviews.length} />

						<DetailTabs tabValue={tabValue} onChange={setTabValue} accommodation={accommodation} />
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
			<ImageGallery
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
