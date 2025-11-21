import { useState } from "react";
import { Place, Star } from "@mui/icons-material";
import { Box, Card, CardContent, CardMedia, IconButton, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import type { Accommodation } from "../../../types/Accommodation";
import { standardize } from "../../../../../utils/moneyConverter";

type AccommodationCardProps = {
	accommodation: Accommodation;
	onRemove?: (accommodationId: string) => void; // callback khi confirm xoá
};

const AccommodationCard: React.FC<AccommodationCardProps> = ({ accommodation, onRemove }) => {
	const [confirmOpen, setConfirmOpen] = useState(false);

	const thumbnails = accommodation.images.filter((i) => i.variant === "THUMBNAIL");
	const image = thumbnails.find((t) => t.isPrimary) ?? thumbnails[0];
	const minPrice = Math.min(...accommodation.rooms.map((r) => Number(r.price)));

	const handleRemoveClick = (e: React.MouseEvent) => {
		e.stopPropagation(); // tránh click lan ra card
		setConfirmOpen(true);
	};

	const handleConfirmRemove = () => {
		onRemove?.(accommodation.id);
		setConfirmOpen(false);
	};

	return (
		<>
			<Card
				sx={{
					borderRadius: 3,
					height: 300,
					display: "flex",
					flexDirection: "column",
				}}
			>
				<Box sx={{ position: "relative" }}>
					<CardMedia component="img" height="160" image={image.url} alt={accommodation.name} sx={{ objectFit: "cover" }} />

					<IconButton
						sx={{
							position: "absolute",
							top: 8,
							right: 8,
							bgcolor: "white",
							"&:hover": { bgcolor: "grey.100", transform: "scale(1.1)" },
							transition: "0.2s",
						}}
						onClick={handleRemoveClick}
					>
						<Star sx={{ color: "gold" }} />
					</IconButton>
				</Box>

				<CardContent sx={{ flexGrow: 1 }}>
					<Typography noWrap variant="subtitle1" fontWeight={600}>
						{accommodation.name}
					</Typography>

					<Box sx={{ display: "flex", alignItems: "center", mt: 0.5, mb: 1 }}>
						<Place sx={{ fontSize: 18, mr: 0.5, color: "text.secondary" }} />
						<Typography noWrap variant="body2" color="text.secondary">
							{accommodation.address.fullAddress}
						</Typography>
					</Box>

					<Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<Star sx={{ fontSize: 18, mr: 0.5, color: "#facc15" }} />
							<Typography fontWeight={600}>{5}</Typography>
						</Box>

						<Box sx={{ textAlign: "right" }}>
							<Typography color="primary" fontWeight={700}>
								${standardize(minPrice)}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								/night
							</Typography>
						</Box>
					</Box>
				</CardContent>
			</Card>

			{/* Modal confirm xoá */}
			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
				<DialogTitle>Remove from Favourite</DialogTitle>
				<DialogContent>
					<Typography>Are you sure you want to remove "{accommodation.name}" from your favourite list?</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
					<Button variant="contained" color="error" onClick={handleConfirmRemove}>
						Remove
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default AccommodationCard;
