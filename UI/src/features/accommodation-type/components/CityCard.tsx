import React from "react";
import { Box, Typography, Card, CardMedia, CardActionArea } from "@mui/material";
import type { City } from "../services/types/City";

interface CityCardProps {
	city: City;
	typeLabel: string;
}

export const CityCard: React.FC<CityCardProps> = ({ city, typeLabel }) => {
	return (
		<Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", transition: "transform 0.3s", "&:hover": { transform: "translateY(-4px)" } }}>
			<CardActionArea>
				<Box sx={{ position: "relative" }}>
					<CardMedia component="img" height="240" image={city.imageUrl} alt={city.name} sx={{ filter: "brightness(0.85)" }} />
					<Box
						sx={{
							position: "absolute",
							bottom: 0,
							left: 0,
							width: "100%",
							p: 2,
							background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
						}}
					>
						<Typography variant="h6" color="white" fontWeight="bold">
							{city.name}
						</Typography>
						<Typography variant="body2" color="rgba(255,255,255,0.8)">
							{city.propertyCount.toLocaleString()} {typeLabel.toLowerCase()}s
						</Typography>
					</Box>
				</Box>
			</CardActionArea>
		</Card>
	);
};
