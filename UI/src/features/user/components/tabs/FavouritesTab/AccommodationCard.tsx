import { Favorite, Place, Star } from "@mui/icons-material";
import { Box, Card, CardContent, CardMedia, IconButton, Typography } from "@mui/material";
import type { Accommodation } from "../../../types/Accommodation";
import { standardize } from "../../../../../utils/moneyConverter";

type AccommodationCardProps = {
	accommodation: Accommodation;
};

const AccommodationCard: React.FC<AccommodationCardProps> = ({ accommodation }) => {
	const thumbnails = accommodation.images.filter((i) => i.variant === "THUMBNAIL");

	const image = thumbnails.find((t) => t.isPrimary) ?? thumbnails[0];

	const minPrice = Math.min(...accommodation.rooms.map((r) => Number(r.price)));

	return (
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
						"&:hover": { bgcolor: "grey.100" },
					}}
				>
					<Favorite sx={{ color: "red" }} />
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
						{/* TODO: Get review */}
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
	);
};

export default AccommodationCard;
