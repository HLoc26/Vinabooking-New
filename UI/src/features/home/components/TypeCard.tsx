import React from "react";
import { Card, CardMedia, CardContent, Typography } from "@mui/material";
import type { AccommodationTypeData } from "../types/AccommodationTypeData";

interface TypeCardProps {
	data: AccommodationTypeData;
	onClick?: () => void;
}

const TypeCard: React.FC<TypeCardProps> = ({ data, onClick }) => {
	return (
		<Card
			onClick={onClick}
			sx={{
				borderRadius: 3,
				overflow: "hidden",
				boxShadow: 2,
				cursor: "pointer",
				transition: "all 0.3s ease",
				"&:hover": {
					boxShadow: 6,
					transform: "translateY(-4px)",
				},
			}}
		>
			{/* Image */}
			<CardMedia
				component="img"
				image={data.imageUrl ?? "/images/defaults.png"}
				alt={data.name}
				sx={{
					height: 160,
					transition: "transform 0.5s ease",
					"&:hover": { transform: "scale(1.05)" },
				}}
			/>

			{/* Content */}
			<CardContent sx={{ textAlign: "center", py: 2 }}>
				<Typography
					variant="h6"
					sx={{
						fontWeight: "bold",
						color: "text.primary",
						transition: "color 0.3s",
						"&:hover": { color: "orange.600" },
					}}
				>
					{data.name}
				</Typography>
			</CardContent>
		</Card>
	);
};

export default TypeCard;
