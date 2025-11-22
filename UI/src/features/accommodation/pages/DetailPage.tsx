import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Container, Grid, Box, CircularProgress, Typography } from "@mui/material";

import { useAccommodationDetail } from "../hooks/useAccommodationDetail";
import { HeroGallery, PropertyHeader, DetailTabs, BookingCard, ImageGalleryDialog } from "../components/detail";

export default function DetailPage() {
	const { accommodationId } = useParams<{ accommodationId: string }>();
	const { accommodation, loading, error, displayImages } = useAccommodationDetail(accommodationId);

	const [openGallery, setOpenGallery] = useState(false);
	const [isFavorite, setIsFavorite] = useState(false);
	const [tabValue, setTabValue] = useState(0);

	const [roomQuantities, setRoomQuantities] = useState<Record<string, number>>({});
	const [startDate, setStartDate] = useState<Date>(new Date("2025-11-07"));
	const [endDate, setEndDate] = useState<Date>(new Date("2025-11-10"));

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
				<HeroGallery images={displayImages} onOpenGallery={() => setOpenGallery(true)} />

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
			<ImageGalleryDialog open={openGallery} onClose={() => setOpenGallery(false)} images={displayImages} propertyName={accommodation.name} />
		</Box>
	);
}
