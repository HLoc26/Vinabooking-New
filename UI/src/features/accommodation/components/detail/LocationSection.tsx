import { Paper, Typography, Box } from "@mui/material";
import type { AccommodationDetail } from "../../types/accommodation.types";

interface Props {
	accommodation: AccommodationDetail;
}

export const LocationSection = ({ accommodation }: Props) => {
	return (
		<Paper sx={{ p: 3, mb: 3 }}>
			<Typography variant="h6" fontWeight="bold" gutterBottom>
				Location
			</Typography>
			<Box
				sx={{
					height: 300,
					bgcolor: "#e0e0e0",
					borderRadius: 1,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					mb: 2,
				}}
			>
				<Typography color="text.secondary">Map will be integrated here (Google Maps/Mapbox)</Typography>
			</Box>
			<Typography variant="body2" color="text.secondary">
				{accommodation.address.fullAddress}
			</Typography>
		</Paper>
	);
};
