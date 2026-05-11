import { useState } from "react";
import { Place, StarRounded } from "@mui/icons-material";
import { Box, Card, CardContent, CardMedia, IconButton, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack } from "@mui/material";
import type { AccommodationDetail } from "../../../../accommodation/types/accommodation.types";
import { useNavigate } from "react-router-dom";
import { getThumbnailUrl } from "../../../../../utils/image";
import { useCurrency } from "../../../../../hooks/useCurrency";

type AccommodationCardProps = {
	accommodation: AccommodationDetail;
	onRemove?: (accommodationId: string) => void; // callback khi confirm xoá
};

const AccommodationCard: React.FC<AccommodationCardProps> = ({ accommodation, onRemove }) => {
	const navigate = useNavigate();
	const { format } = useCurrency();
	const [confirmOpen, setConfirmOpen] = useState(false);

	const images = accommodation?.images || [];

	const displayUrl = getThumbnailUrl(images);

	const rooms = accommodation?.rooms || [];
	const minPrice = rooms.length > 0 ? Math.min(...rooms.map((r) => Number(r.price))) : 0;

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
				onClick={() => navigate(`/accommodation/${accommodation.id}`)}
				sx={{
					borderRadius: 3,
					height: 300,
					display: "flex",
					flexDirection: "column",
					cursor: "pointer",
					transition: "transform 0.2s, box-shadow 0.2s",
					"&:hover": {
						transform: "translateY(-4px)",
						boxShadow: "0 4px 20px 0 rgba(0,0,0,0.12)",
					},
				}}
			>
				<Box sx={{ position: "relative" }}>
					<CardMedia component="img" height="160" image={displayUrl ?? "/images/default.jpg"} alt={accommodation?.name || "Accommodation"} sx={{ objectFit: "cover" }} />

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
						<StarRounded sx={{ color: "gold" }} />
					</IconButton>
				</Box>

				<CardContent sx={{ flexGrow: 1 }}>
					<Typography noWrap variant="subtitle1" fontWeight={600}>
						{accommodation?.name || "Unknown Accommodation"}
					</Typography>

					<Box sx={{ display: "flex", alignItems: "center", mt: 0.5, mb: 1 }}>
						<Place sx={{ fontSize: 18, mr: 0.5, color: "text.secondary" }} />
						<Typography noWrap variant="body2" color="text.secondary">
							{accommodation?.address?.fullAddress || "Address not available"}
						</Typography>
					</Box>

					<Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<StarRounded sx={{ fontSize: 18, mr: 0.5, color: "gold" }} />
							<Typography fontWeight={600}>{5}</Typography>
						</Box>

						<Stack direction="row" sx={{ textAlign: "right" }} alignItems={"end"} spacing={0.5}>
							<Typography color="primary" fontWeight={700}>
								{minPrice > 0 ? format(minPrice) : "N/A"}
							</Typography>
							{minPrice > 0 && (
								<Typography variant="caption" color="text.secondary">
									/night
								</Typography>
							)}
						</Stack>
					</Box>
				</CardContent>
			</Card>

			{/* Modal confirm xoá */}
			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
				<DialogTitle>Remove from Favourite</DialogTitle>
				<DialogContent>
					<Typography>Are you sure you want to remove "{accommodation?.name}" from your favourite list?</Typography>
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
