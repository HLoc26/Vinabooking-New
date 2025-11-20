import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Container, Grid, Box, CircularProgress, Typography } from "@mui/material";

import { useAccommodationDetail } from "../hooks/useAccommodationDetail";
import { HeroGallery, PropertyHeader, DetailTabs, BookingCard } from "../components/detail";
import ImageGallery from "../../../components/ui/ImageGallery";

export default function DetailPage() {
	const { accommodationId } = useParams<{ accommodationId: string }>();
	const { accommodation, loading, error, thumbnails, displayImages } = useAccommodationDetail(accommodationId);

	const [isFavorite, setIsFavorite] = useState(false);
	const [tabValue, setTabValue] = useState(0);

	const [roomQuantities, setRoomQuantities] = useState<Record<string, number>>({});
	const [startDate, setStartDate] = useState<Date>(new Date("2025-11-07"));
	const [endDate, setEndDate] = useState<Date>(new Date("2025-11-10"));

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

	// Tính số đêm
	const nights = Math.max(0, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

	// Tính tổng tiền – type-safe và tối ưu bằng useMemo
	const totalPrice = useMemo(() => {
		if (!accommodation) return 0;

		return Object.entries(roomQuantities).reduce((sum, [roomId, qty]) => {
			if (qty <= 0) return sum;
			const room = accommodation.rooms.find((r) => r.id === roomId);
			if (!room) return sum;
			return sum + qty * parseFloat(room.price) * nights;
		}, 0);
	}, [accommodation, roomQuantities, nights]);

	const handleRoomQuantityChange = (roomId: string, qty: number) => {
		if (qty < 0) return;
		setRoomQuantities((prev) => ({ ...prev, [roomId]: qty }));
	};

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
				{error || "Không tìm thấy chỗ ở này"}
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
						<PropertyHeader accommodation={accommodation} isFavorite={isFavorite} onToggleFavorite={() => setIsFavorite(!isFavorite)} />

						<DetailTabs tabValue={tabValue} onChange={setTabValue} accommodation={accommodation} roomQuantities={roomQuantities} onRoomQuantityChange={handleRoomQuantityChange} />
					</Grid>

					{/* Cột phải – booking card sticky */}
					<Grid size={{ xs: 12, md: 4 }}>
						<BookingCard nights={nights} totalPrice={totalPrice} startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate} />
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
