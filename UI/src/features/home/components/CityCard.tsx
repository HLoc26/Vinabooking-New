import React from "react";
import { Card, Box, Typography, Chip } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useNavigate } from "react-router-dom";
import type { City } from "../types/City";
import { ACCOMMODATION_LABELS } from "../constants/Const";
import type { EAccommodationType } from "../../../types/Accommodation";

interface CityCardProps {
	city: City;
	type: EAccommodationType;
	typeLabel?: string;
}

const CityCard: React.FC<CityCardProps> = ({ city, type, typeLabel = ACCOMMODATION_LABELS["ALL"] }) => {
	const navigate = useNavigate();

	return (
		<Card
			onClick={() => navigate(`/search?keyword=${encodeURIComponent(city.name)}&type=${encodeURIComponent(type)}`)}
			sx={{
				position: "relative",
				borderRadius: 4,
				overflow: "hidden",
				aspectRatio: "3 / 4",
				cursor: "pointer",
				transition: "all 0.3s ease",
				boxShadow: 4,
				"&:hover": {
					boxShadow: 8,
					transform: "translateY(-4px)",
				},
			}}
		>
			<Box
				component="img"
				src={city.imageUrl ?? "/images/default.png"}
				alt={city.name}
				sx={{
					width: "100%",
					height: "100%",
					objectFit: "cover",
					transition: "transform 0.5s ease",
					"&:hover": { transform: "scale(1.1)" },
				}}
			/>

			<Box
				sx={{
					position: "absolute",
					inset: 0,
					display: "flex",
					flexDirection: "column",
					justifyContent: "flex-end",
					p: 3,
					background: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), transparent)",
				}}
			>
				<Typography
					variant="h6"
					sx={{
						color: "#fff",
						fontWeight: "bold",
						display: "flex",
						alignItems: "center",
						mb: 0.5,
					}}
				>
					<LocationOnIcon sx={{ fontSize: 18, color: "#fb923c", mr: 0.8 }} />
					{city.name}
				</Typography>

				<Typography variant="body2" color="white">
					{city.propertyCount} {typeLabel}
					{city.propertyCount !== 1 ? "s" : ""}{" "}
				</Typography>
			</Box>

			<Chip
				label="Popular"
				size="small"
				sx={{
					position: "absolute",
					top: 12,
					right: 12,
					backgroundColor: "orange",
					color: "white",
					fontWeight: "bold",
					opacity: 0,
					transition: "opacity 0.3s",
					".MuiCard-root:hover &": { opacity: 1 },
				}}
			/>
		</Card>
	);
};

export default CityCard;
