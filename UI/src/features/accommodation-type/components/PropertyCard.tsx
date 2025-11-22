import React from "react";
import { Box, Typography, Card, CardMedia, CardContent, IconButton } from "@mui/material";
import { Heart } from "lucide-react";
import type { Property } from "../types/Property";

export const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
	return (
		<Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
			<IconButton
				sx={{
					position: "absolute",
					top: 10,
					right: 10,
					zIndex: 2,
					bgcolor: "white",
					p: 0.8,
					"&:hover": { bgcolor: "white", color: "red" },
				}}
			>
				<Heart size={18} />
			</IconButton>
			<CardMedia component="img" height="200" image={property.imageUrl} alt={property.title} />
			<CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
				<Box>
					<Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
						<Typography variant="h6" fontSize="1.1rem" fontWeight="bold" lineHeight={1.3}>
							{property.title}
						</Typography>
					</Box>
					<Typography variant="body2" color="text.secondary" mb={1}>
						{property.location}
					</Typography>
				</Box>

				<Box>
					<Box display="flex" alignItems="center" mb={1.5}>
						<Box bgcolor="primary.main" color="white" px={0.6} py={0.2} borderRadius={0.5} fontSize="0.75rem" fontWeight="bold" mr={1}>
							{property.rating}
						</Box>
						<Typography variant="caption" color="text.secondary">
							({property.reviews} reviews)
						</Typography>
					</Box>
					<Box display="flex" alignItems="baseline" justifyContent="flex-end">
						<Typography variant="caption" color="text.secondary" mr={0.5}>
							from
						</Typography>
						<Typography variant="h6" fontWeight="bold" color="text.primary">
							${property.price}
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
