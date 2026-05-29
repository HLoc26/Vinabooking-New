import React, { type Dispatch, type SetStateAction } from "react";
import { Box, Typography, Checkbox, Divider, CardContent, Card, Button, FormControlLabel, Chip } from "@mui/material";
import { Apartment, CalendarToday, LocalFireDepartment, LocalOffer, LocationOn, People } from "@mui/icons-material";
import { formatDate } from "../../../../utils/dateFormatter";
import type { AccommodationDetail } from "../../../accommodation/types/accommodation.types";
import type { QuoteResponse } from "../../types/pricing.types";
import useAccommodation from "../../../accommodation/hooks/useAccommodation";
import type { RootState } from "../../../../app/store";
import { useSelector } from "react-redux";
import { useCurrency } from "../../../../hooks/useCurrency";

interface Props {
	accommInfo: AccommodationDetail;
	quote?: QuoteResponse;
	agreed: boolean;
	setAgreed: Dispatch<SetStateAction<boolean>>;
	// FIX: Changed from Image[] to string[] to match parent state
	setGalleryImages: Dispatch<SetStateAction<string[]>>;
	openImageGallery: (index: number) => void;
	handleProceed: () => void;
}

const AccommodationInfoBox: React.FC<Props> = ({ accommInfo, quote, agreed, setAgreed, setGalleryImages, openImageGallery, handleProceed }) => {
	const bookingContext = useSelector((state: RootState) => state.booking);
	const { data: accomImages, isLoading: accomImagesLoading } = useAccommodation(accommInfo?.id ?? "");
	const { format } = useCurrency();

	if (!accommInfo) {
		return <Typography>Accommodation not found</Typography>;
	}

	// BE owns all pricing math (dynamic-pricing.md §4). Render the totals the
	// /pricing/quote endpoint returned; suppress price block until it arrives.
	const totals = quote?.totals;
	const payablePrice = totals?.payablePrice;
	const listPrice = totals?.listPrice;
	const discountApplied = !!totals?.discountApplied && payablePrice !== undefined && listPrice !== undefined && payablePrice < listPrice;
	const holidayApplied = !!totals?.holidayApplied;

	// FIX: Extract WEBP URLs properly
	const webpUrls: string[] = (accomImages?.images || []).map((img) => {
		const webpVariant = img.variants.find((v) => v.variant === "WEBP");
		return webpVariant ? webpVariant.url : img.url; // Use variant or fallback to main URL
	});

	// FIX: Filter Thumbnail objects correctly using .some()
	const thumbnails = (accomImages?.images || []).filter((i) => i.variants.some((v) => v.variant === "THUMBNAIL"));

	const mainThumbnail = thumbnails[0];
	const gridThumbnails = thumbnails.slice(1, 5);
	const remainingCount = Math.max(0, webpUrls.length - 5); // Correct count for overlay

	const handlePhotoClick = (index: number) => {
		setGalleryImages(webpUrls);
		// Using setTimeout to ensure state is set before opening
		setTimeout(() => openImageGallery(index), 0);
	};

	return (
		<Card sx={{ borderRadius: 2 }}>
			<CardContent>
				<Typography variant="h6" mb={2} fontWeight="bold">
					Accommodation Information
				</Typography>

				{/* Gallery Preview */}
				{thumbnails.length > 0 ? (
					<Box sx={{ mb: 2 }}>
						<Box
							component="img"
							src={mainThumbnail?.variants.find((v) => v.variant === "THUMBNAIL")?.url || mainThumbnail?.url}
							alt={accommInfo.name}
							onClick={() => handlePhotoClick(0)}
							sx={{
								width: "100%",
								height: 180,
								objectFit: "cover",
								borderRadius: 2,
								cursor: "pointer",
								mb: 1,
								border: "1px solid #eee",
							}}
						/>

						{gridThumbnails.length > 0 && (
							<Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, position: "relative" }}>
								{gridThumbnails.map((img, idx) => (
									<Box key={idx} sx={{ position: "relative" }}>
										<Box
											component="img"
											src={img.variants.find((v) => v.variant === "THUMBNAIL")?.url || img.url}
											alt={`Thumbnail ${idx + 2}`}
											onClick={() => handlePhotoClick(idx + 1)}
											sx={{
												width: "100%",
												height: 60,
												objectFit: "cover",
												borderRadius: 1,
												cursor: "pointer",
											}}
										/>
										{/* Overlay on the last visible thumbnail */}
										{idx === 3 && remainingCount > 0 && (
											<Box
												onClick={() => handlePhotoClick(4)}
												sx={{
													position: "absolute",
													inset: 0,
													bgcolor: "rgba(0,0,0,0.6)",
													color: "white",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													borderRadius: 1,
													cursor: "pointer",
													fontWeight: "bold",
												}}
											>
												+{remainingCount}
											</Box>
										)}
									</Box>
								))}
							</Box>
						)}
					</Box>
				) : (
					<Box sx={{ width: "100%", height: 150, bgcolor: "#f5f5f5", borderRadius: 2, mb: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
						<Typography color="text.secondary">{accomImagesLoading ? "Loading images..." : "No images available"}</Typography>
					</Box>
				)}

				<Box display="flex" alignItems="center" gap={1} mb={1}>
					<Apartment fontSize="small" color="action" />
					<Typography fontWeight={600}>{accommInfo.name}</Typography>
				</Box>

				<Box display="flex" alignItems="start" gap={1} mb={2}>
					<LocationOn fontSize="small" color="action" sx={{ mt: 0.3 }} />
					<Typography variant="body2" color="text.secondary">
						{accommInfo.address.fullAddress}
					</Typography>
				</Box>

				<Divider sx={{ my: 2 }} />

				<Box display="flex" flexDirection="column" gap={1.5} mb={2}>
					<Box display="flex" alignItems="center" gap={1}>
						<CalendarToday fontSize="small" color="primary" />
						<Typography variant="body2">
							<strong>Check-in:</strong> {formatDate(bookingContext.startDate.toString())}
						</Typography>
					</Box>
					<Box display="flex" alignItems="center" gap={1}>
						<CalendarToday fontSize="small" color="primary" />
						<Typography variant="body2">
							<strong>Check-out:</strong> {formatDate(bookingContext.endDate.toString())}
						</Typography>
					</Box>
					<Box display="flex" alignItems="center" gap={1}>
						<People fontSize="small" color="primary" />
						<Typography variant="body2">
							<strong>Guests:</strong> {bookingContext.guestCount}
						</Typography>
					</Box>
				</Box>

				<Divider sx={{ my: 2 }} />

				<Box mb={3}>
					<Typography variant="subtitle2" color="text.secondary">
						Total Price
					</Typography>
					{payablePrice === undefined ? (
						<Typography variant="body2" color="text.secondary">
							Calculating…
						</Typography>
					) : (
						<>
							{discountApplied && listPrice !== undefined && (
								<Typography variant="body2" color="text.secondary" sx={{ textDecoration: "line-through", lineHeight: 1.2 }}>
									{format(listPrice)}
								</Typography>
							)}
							<Typography variant="h4" fontWeight="bold" sx={{ color: discountApplied ? "#e53e3e" : "primary.main" }}>
								{format(payablePrice)}
							</Typography>
							<Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
								{holidayApplied && <Chip icon={<LocalFireDepartment fontSize="small" />} label="Holiday rate" size="small" color="warning" />}
								{discountApplied && <Chip icon={<LocalOffer fontSize="small" />} label="Promotion applied" size="small" color="success" />}
							</Box>
						</>
					)}
				</Box>

				<FormControlLabel
					required
					control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />}
					label={<Typography variant="body2">I confirm all information is correct.</Typography>}
					sx={{ mb: 2, alignItems: "flex-start" }}
				/>

				<Button
					variant="contained"
					fullWidth
					size="large"
					onClick={handleProceed}
					sx={{
						py: 1.5,
						fontWeight: "bold",
						bgcolor: "warning.main",
						"&:hover": { bgcolor: "warning.dark" },
					}}
				>
					Proceed to Payment
				</Button>
			</CardContent>
		</Card>
	);
};

export default AccommodationInfoBox;
