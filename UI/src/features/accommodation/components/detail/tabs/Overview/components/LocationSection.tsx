import { Paper, Typography, Box, Button, Link } from "@mui/material";
import type { AccommodationDetail } from "../../../../../types/accommodation.types";
interface Props {
	accommodation: AccommodationDetail;
}

export const LocationSection = ({ accommodation }: Props) => {
	const { latitude, longitude, fullAddress } = accommodation.address;

	// Link OpenStreetMap
	const mapsUrl = latitude && longitude ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15` : undefined;
	console.log(mapsUrl);
	const lat = Number(latitude);
	const lon = Number(longitude);
	return (
		<Paper sx={{ p: 3, mb: 3 }}>
			<Typography variant="h6" fontWeight="bold" gutterBottom>
				Location
			</Typography>

			<Box
				sx={{
					height: { xs: 200, sm: 250, md: 300 },
					borderRadius: 1,
					overflow: "hidden",
					mb: 2,
				}}
			>
				{latitude && longitude ? (
					<iframe
						width="100%"
						height="100%"
						style={{ border: 0 }}
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
						src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon - 1e-3}%2C${lat - 1e-3}%2C${lon + 1e-3}%2C${lat + 1e-3}&layer=mapnik&marker=${latitude}%2C${longitude}`}
					/>
				) : (
					<Box
						sx={{
							height: "100%",
							bgcolor: "#e0e0e0",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Typography color="text.secondary">Map not available</Typography>
					</Box>
				)}
			</Box>

			<Typography variant="body2" color="text.secondary" mb={1}>
				{fullAddress || "Address not available"}
			</Typography>

			{mapsUrl && (
				<Button variant="outlined" color="primary" component={Link} href={mapsUrl} target="_blank" rel="noopener noreferrer">
					View on OpenStreetMap
				</Button>
			)}
		</Paper>
	);
};
