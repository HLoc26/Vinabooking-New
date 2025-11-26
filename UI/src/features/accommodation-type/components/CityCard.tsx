import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardMedia, Typography, Box } from "@mui/material";
import type { City } from "../types/City";

interface CityCardProps {
	city: City;
	typeLabel: string;
}

export const CityCard: React.FC<CityCardProps> = ({ city, typeLabel }) => {
	const navigate = useNavigate();

	const handleClick = () => {
		navigate(`/search?keyword=${encodeURIComponent(city.name)}`);
	};

	return (
		<Card
			onClick={handleClick}
			sx={{
				minWidth: 280,
				maxWidth: 280,
				cursor: "pointer",
				transition: "transform 0.2s, box-shadow 0.2s",
				"&:hover": {
					transform: "translateY(-4px)",
					boxShadow: 6,
				},
			}}
		>
			<CardMedia
				component="img"
				height="200"
				image={city.imageUrl}
				alt={city.name}
				sx={{
					objectFit: "cover",
				}}
			/>
			<CardContent>
				<Typography variant="h6" fontWeight={700} gutterBottom>
					{city.name}
				</Typography>
				<Box display="flex" alignItems="center" gap={0.5}>
					<Typography variant="body2" color="text.secondary">
						{city.propertyCount} {typeLabel}
						{city.propertyCount !== 1 ? "s" : ""}
					</Typography>
				</Box>
			</CardContent>
		</Card>
	);
};
