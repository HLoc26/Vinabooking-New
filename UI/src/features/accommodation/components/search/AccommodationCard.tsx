import React from "react";
import { Card, CardMedia, CardContent, Box, Chip, Typography, Rating, Divider } from "@mui/material";
import { LocationOn } from "@mui/icons-material";
import type { AccommodationListItem } from "../../types/accommodation.types";
import { ACCOMMODATION_TYPE_OPTIONS } from "../../constants/searchFilters";
import FavouriteButton from "../../../../components/shared/FavouriteButton";
import { standardize } from "../../../../utils/moneyConverter";

interface Props {
	accommodation: AccommodationListItem;
	variant: "grid" | "list";
	onClick: (id: string) => void;
}

const getTypeLabel = (type: string): string => {
	const found = ACCOMMODATION_TYPE_OPTIONS.find((t) => t.value === type);
	return found ? found.label : type;
};

export const AccommodationCard: React.FC<Props> = ({ accommodation, variant, onClick }) => {
	const image = accommodation.thumbnail ?? `/images/${accommodation.type}.png`;
	if (variant === "list") {
		return (
			<Card
				onClick={() => onClick(accommodation.id)}
				sx={{
					display: "flex",
					mb: 2,
					cursor: "pointer",
					transition: "all 0.3s",
					"&:hover": {
						boxShadow: 6,
					},
				}}
			>
				<CardMedia component="img" sx={{ width: 280, maxHeight: 250, objectFit: "cover" }} image={image} alt={accommodation.name} />
				<Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
					<CardContent sx={{ flex: 1, p: 3 }}>
						<Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
							<Box sx={{ flex: 1 }}>
								<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
									<Chip label={getTypeLabel(accommodation.type)} size="small" color="primary" variant="outlined" />
									{accommodation.distance && (
										<Typography variant="caption" color="text.secondary">
											{accommodation.distance} km from center
										</Typography>
									)}
								</Box>
								<Typography variant="h6" component="div" fontWeight="bold" sx={{ mb: 1, "&:hover": { color: "primary.main" } }}>
									{accommodation.name}
								</Typography>
								<Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
									<LocationOn sx={{ fontSize: 16, color: "text.secondary" }} />
									<Typography variant="body2" color="text.secondary">
										{accommodation.address.district}, {accommodation.address.city}
									</Typography>
								</Box>
								<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
									<Rating value={accommodation.rating || 4.5} readOnly precision={0.1} size="small" />
									<Typography variant="body2" fontWeight="bold">
										{accommodation.rating || 4.5}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										({accommodation.reviewCount || 0} reviews)
									</Typography>
								</Box>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{
										mb: 2,
										overflow: "hidden",
										textOverflow: "ellipsis",
										display: "-webkit-box",
										WebkitLineClamp: 3,
										WebkitBoxOrient: "vertical",
									}}
								>
									{accommodation.description}
								</Typography>
							</Box>
							<Box
								sx={{
									ml: 3,
									display: "flex",
									flexDirection: "column",
									alignItems: "flex-end",
									justifyContent: "space-between",
								}}
							>
								<FavouriteButton accommodationId={accommodation.id} />

								<Box sx={{ textAlign: "right" }}>
									<Typography variant="caption" color="text.secondary">
										Starting from
									</Typography>
									<Typography variant="h5" color="primary" fontWeight="bold">
										${standardize(accommodation.minPrice || 100)}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										per night
									</Typography>
								</Box>
							</Box>
						</Box>
					</CardContent>
				</Box>
			</Card>
		);
	}

	// grid
	return (
		<Card
			onClick={() => onClick(accommodation.id)}
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				cursor: "pointer",
				transition: "all 0.3s",
				position: "relative",
				"&:hover": {
					transform: "translateY(-8px)",
					boxShadow: 6,
				},
			}}
		>
			<Box sx={{ position: "relative" }}>
				<CardMedia component="img" height="220" image={image} alt={accommodation.name} sx={{ objectFit: "cover" }} />

				<Box sx={{ position: "absolute", top: 8, right: 8 }}>
					<FavouriteButton accommodationId={accommodation.id} />
				</Box>

				<Chip
					label={getTypeLabel(accommodation.type)}
					size="small"
					color="primary"
					sx={{
						position: "absolute",
						top: 8,
						left: 8,
					}}
				/>
			</Box>

			<CardContent sx={{ flexGrow: 1, p: 2.5 }}>
				<Typography
					variant="h6"
					component="div"
					fontWeight="bold"
					sx={{
						mb: 1,
						overflow: "hidden",
						textOverflow: "ellipsis",
						display: "-webkit-box",
						WebkitLineClamp: 1,
						WebkitBoxOrient: "vertical",
						"&:hover": { color: "primary.main" },
					}}
				>
					{accommodation.name}
				</Typography>

				<Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
					<LocationOn sx={{ fontSize: 16, color: "text.secondary" }} />
					<Typography variant="body2" color="text.secondary" noWrap>
						{accommodation.address.district}, {accommodation.address.city}
					</Typography>
				</Box>

				<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
					<Rating value={accommodation.rating || 4.5} readOnly precision={0.1} size="small" />
					<Typography variant="body2" fontWeight="bold">
						{accommodation.rating || 4.5}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						({accommodation.reviewCount || 0})
					</Typography>
				</Box>

				{accommodation.distance && (
					<Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
						{accommodation.distance} km from center
					</Typography>
				)}

				<Typography
					variant="body2"
					color="text.secondary"
					sx={{
						mb: 2,
						overflow: "hidden",
						textOverflow: "ellipsis",
						display: "-webkit-box",
						WebkitLineClamp: 2,
						WebkitBoxOrient: "vertical",
					}}
				>
					{accommodation.description}
				</Typography>

				<Divider sx={{ mb: 1 }} />

				<Box sx={{ display: "flex", flexDirection: "row", justifyContent: "end", alignItems: "center" }}>
					<Box sx={{ display: "flex", alignItems: "baseline" }}>
						<Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
							From
						</Typography>{" "}
						<Typography variant="h6" color="primary" fontWeight="bold">
							${standardize(accommodation.minPrice || 100)}
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
							/ night
						</Typography>
					</Box>
				</Box>
			</CardContent>
		</Card>
	);
};
