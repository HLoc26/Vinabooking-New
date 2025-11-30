import { Paper, Box, Typography, Rating, Chip, IconButton } from "@mui/material";
import { LocationOn, Share } from "@mui/icons-material";
import type { AccommodationDetail } from "../../types/accommodation.types";
import FavouriteButton from "../../../../components/shared/FavouriteButton";

interface Props {
	accommodation: AccommodationDetail;
	averageRating?: number;
	reviewCount?: number;
}

export const PropertyHeader = ({ accommodation, averageRating = 4.5, reviewCount = 4 }: Props) => {
	return (
		<Paper sx={{ p: 3, mb: 3 }}>
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
				<Box>
					<Typography variant="h4" fontWeight="bold" gutterBottom>
						{accommodation.name}
					</Typography>

					<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
							<Rating value={averageRating} precision={0.1} readOnly size="small" />
							<Typography variant="body2" fontWeight="bold">
								{averageRating}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								({reviewCount} reviews)
							</Typography>
						</Box>
						<Chip label={accommodation.type} size="small" color="primary" />
					</Box>

					<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
						<LocationOn sx={{ fontSize: 18, color: "primary.main" }} />
						<Typography variant="body2" color="text.secondary">
							{accommodation.address.fullAddress}
						</Typography>
					</Box>
				</Box>

				<Box sx={{ display: "flex", gap: 1 }}>
					<FavouriteButton accommodationId={accommodation.id} />
					<IconButton>
						<Share />
					</IconButton>
				</Box>
			</Box>
		</Paper>
	);
};
