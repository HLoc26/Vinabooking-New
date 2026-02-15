import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Container, Grid, Box, CircularProgress, Typography } from "@mui/material";

import { HeroGallery, PropertyHeader, DetailTabs, BookingCard } from "../components/detail";
import ImageGallery from "../../../components/shared/ImageGallery";
import useAccommodation from "../hooks/useAccommodation";
import useAccommodationRooms from "../hooks/useAccommodationRooms";
import { useReviews } from "../hooks/useReviews";
import { parseInputDate, toInputDate } from "../../../utils/dateFormatter";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { resetBooking, setBookingField } from "../../../features/booking/bookingSlice";

// Helper format date YYYY-MM-DD
const formatDateParam = (date: Date) => date.toLocaleDateString("sv-SE");

export default function DetailPage() {
	const navigate = useNavigate();
	const { accommodationId } = useParams<{ accommodationId: string }>();
	const [searchParams, setSearchParams] = useSearchParams();

	const dispatch = useDispatch();
	const bookingInfo = useSelector((state: RootState) => state.booking);
	const searchCriteria = useSelector((state: RootState) => state.search);

	// TODO: navigate to 404 error
	if (!accommodationId) navigate("/");

	const { data: accommodation, isLoading: loading, isError: error } = useAccommodation(accommodationId ?? "");
	const { data: rawRooms } = useAccommodationRooms(accommodationId ?? "");
	const rooms = rawRooms ?? [];

	const getThumbnails = (): string[] => {
		if (!accommodation?.images) return [];

		return accommodation?.images.map((img) => img.variants.find((v) => v.variant === "THUMBNAIL")?.url).filter((url): url is string => !!url);
	};

	const getDisplayImages = (): string[] => {
		if (!accommodation?.images) return [];

		return accommodation?.images.map((img) => img.variants.find((v) => v.variant === "WEBP")?.url).filter((url): url is string => !!url);
	};

	const { data: rawReviews } = useReviews(accommodation?.id ?? "");
	const reviews = rawReviews ?? [];
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
		if (bookingInfo.accommodationId && bookingInfo.accommodationId !== accommodationId) {
			dispatch(resetBooking());
		}
		dispatch(setBookingField({ key: "accommodationId", value: accommodationId }));

		const urlCheckIn = searchParams.get("checkIn");
		const urlCheckOut = searchParams.get("checkOut");

		let finalCheckIn: Date;
		let finalCheckOut: Date;
		let shouldUpdateUrl = false;

		if (urlCheckIn && urlCheckOut) {
			finalCheckIn = new Date(urlCheckIn);
			finalCheckOut = new Date(urlCheckOut);
		} else {
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);

			const dayAfter = new Date();
			dayAfter.setDate(dayAfter.getDate() + 2);

			finalCheckIn = parseInputDate(searchCriteria.dates?.checkIn || toInputDate(tomorrow));
			finalCheckOut = parseInputDate(searchCriteria.dates?.checkOut || toInputDate(dayAfter));

			shouldUpdateUrl = true;
		}

		if (finalCheckIn.getTime() !== bookingInfo.startDate.getTime()) {
			dispatch(setBookingField({ key: "startDate", value: finalCheckIn }));
		}
		if (finalCheckOut.getTime() !== bookingInfo.endDate.getTime()) {
			dispatch(setBookingField({ key: "endDate", value: finalCheckOut }));
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
		const safeIndex = Math.min(Math.max(0, index), getDisplayImages().length);
		setCurrentIndex(safeIndex);
		setOpenGallery(true);
	};

	const closeGallery = () => setOpenGallery(false);

	const handlePrevImage = () => {
		setCurrentIndex((prev) => (prev === 0 ? getDisplayImages().length - 1 : prev - 1));
	};

	const handleNextImage = () => {
		setCurrentIndex((prev) => (prev === getDisplayImages().length - 1 ? 0 : prev + 1));
	};

	const handleUpdateStartDate = (newDate: Date) => {
		dispatch(setBookingField({ key: "startDate", value: newDate }));
		const newParams = new URLSearchParams(searchParams);
		newParams.set("checkIn", formatDateParam(newDate));
		setSearchParams(newParams);
	};

	const handleUpdateEndDate = (newDate: Date) => {
		dispatch(setBookingField({ key: "endDate", value: newDate }));
		const newParams = new URLSearchParams(searchParams);
		newParams.set("checkOut", formatDateParam(newDate));
		setSearchParams(newParams);
	};

	// Tính số đêm
	const nights = Math.max(0, Math.ceil((bookingInfo.endDate.getTime() - bookingInfo.startDate.getTime()) / (1000 * 60 * 60 * 24)));

	const totalPrice = useMemo(() => {
		if (!accommodation) return 0;

		return bookingInfo.items.reduce((sum, item) => {
			const room = rooms.find((r) => r.id === item.id);
			if (!room) return sum;
			return sum + item.count * parseFloat(room.price) * nights;
		}, 0);
	}, [accommodation, bookingInfo.items, nights, rooms]);

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
				<HeroGallery images={getThumbnails()} onOpenGallery={(i) => openImageGallery(i)} />

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
				galleryImages={getDisplayImages()}
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
