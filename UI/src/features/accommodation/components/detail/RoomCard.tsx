import { Paper, Box, Typography, IconButton, Chip, Divider } from "@mui/material";
import { Person, Hotel, SquareFoot, Bathtub, Visibility, Remove, Add } from "@mui/icons-material";

import type { AccommodationDetail } from "../../types/accommodation.types";

interface Props {
	room: AccommodationDetail["rooms"][0];
	quantity: number;
	availableRooms: number;
	onIncrease: () => void;
	onDecrease: () => void;
}

export const RoomCard = ({ room, quantity, availableRooms, onIncrease, onDecrease }: Props) => {
	const isLowStock = availableRooms <= 3;
	const price = Math.floor(parseFloat(room.price));

	return (
		<Paper
			elevation={0}
			sx={{
				mb: 2.5,
				borderRadius: 3,
				border: "1px solid",
				borderColor: quantity > 0 ? "primary.main" : "grey.200",
				overflow: "hidden",
				transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
				position: "relative",
				"&:hover": {
					borderColor: "primary.main",
					boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
					transform: "translateY(-2px)",
				},
			}}
		>
			{/* Selection indicator */}
			{quantity > 0 && (
				<Box
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						height: 4,
						bgcolor: "primary.main",
					}}
				/>
			)}

			<Box sx={{ p: { xs: 2, sm: 3 } }}>
				{/* Header section */}
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5, gap: 2 }}>
					<Box sx={{ flex: 1 }}>
						<Typography variant="h6" fontWeight={600} sx={{ mb: 0.5, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
							{room.name}
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: "0.875rem" }}>
							{room.description}
						</Typography>
					</Box>

					<Box sx={{ textAlign: "right" }}>
						<Typography variant="h4" fontWeight={700} color="primary.main" sx={{ lineHeight: 1.2 }}>
							${price}
						</Typography>
						<Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
							per night
						</Typography>
					</Box>
				</Box>

				{/* Room features - OPTION 2: Minimal with dividers */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						flexWrap: "wrap",
						gap: 2,
						py: 2,
						mb: 2.5,
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
						<Person sx={{ fontSize: 18, color: "text.secondary" }} />
						<Typography variant="body2" color="text.primary" fontWeight={500}>
							{room.maxAdults} {room.maxAdults === 1 ? "Adult" : "Adults"}
							{room.maxChildren > 0 && (
								<Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
									(+{room.maxChildren})
								</Typography>
							)}
						</Typography>
					</Box>

					<Divider orientation="vertical" flexItem sx={{ height: 20, alignSelf: "center" }} />

					<Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
						<Hotel sx={{ fontSize: 18, color: "text.secondary" }} />
						<Typography variant="body2" color="text.primary" fontWeight={500}>
							{room.beds.length} {room.beds.length === 1 ? "Bed" : "Beds"}
							{room.beds.length > 0 && (
								<Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
									({room.beds[0].bedType})
								</Typography>
							)}
						</Typography>
					</Box>

					<Divider orientation="vertical" flexItem sx={{ height: 20, alignSelf: "center" }} />

					<Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
						<SquareFoot sx={{ fontSize: 18, color: "text.secondary" }} />
						<Typography variant="body2" color="text.primary" fontWeight={500}>
							{room.size} m²
						</Typography>
					</Box>

					<Divider orientation="vertical" flexItem sx={{ height: 20, alignSelf: "center" }} />

					<Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
						<Bathtub sx={{ fontSize: 18, color: "text.secondary" }} />
						<Typography variant="body2" color="text.primary" fontWeight={500}>
							{room.bathroomCount} {room.bathroomCount === 1 ? "Bath" : "Baths"}
						</Typography>
					</Box>

					{room.viewType && (
						<>
							<Divider orientation="vertical" flexItem sx={{ height: 20, alignSelf: "center" }} />
							<Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
								<Visibility sx={{ fontSize: 18, color: "text.secondary" }} />
								<Typography variant="body2" color="text.primary" fontWeight={500}>
									{room.viewType} view
								</Typography>
							</Box>
						</>
					)}
				</Box>

				{/* Amenities section */}
				<Box sx={{ mb: 2.5 }}>
					<Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block", fontWeight: 600 }}>
						Amenities
					</Typography>
					<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
						{room.amenities.slice(0, 6).map((a) => (
							<Chip
								key={a.id}
								label={a.amenity.name}
								size="small"
								sx={{
									height: 24,
									fontSize: "0.75rem",
									bgcolor: "background.paper",
									border: "1px solid",
									borderColor: "grey.300",
									"&:hover": { borderColor: "primary.main", bgcolor: "primary.50" },
								}}
							/>
						))}
						{room.amenities.length > 6 && (
							<Chip
								label={`+${room.amenities.length - 6} more`}
								size="small"
								sx={{
									height: 24,
									fontSize: "0.75rem",
									bgcolor: "primary.50",
									color: "primary.main",
									fontWeight: 600,
								}}
							/>
						)}
					</Box>
				</Box>

				{/* Footer - Availability & Quantity control */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						pt: 2.5,
						borderTop: "1px solid",
						borderColor: "grey.200",
						flexWrap: "wrap",
						gap: 2,
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<Box
							sx={{
								width: 8,
								height: 8,
								borderRadius: "50%",
								bgcolor: isLowStock ? "error.main" : "success.main",
								animation: isLowStock ? "pulse 2s infinite" : "none",
								"@keyframes pulse": {
									"0%, 100%": { opacity: 1 },
									"50%": { opacity: 0.5 },
								},
							}}
						/>
						<Typography variant="body2" fontWeight={600} color={isLowStock ? "error.main" : "success.main"}>
							{availableRooms === 1 ? "Only 1 left" : `${availableRooms} available`}
						</Typography>
					</Box>

					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1.5,
							bgcolor: "grey.50",
							borderRadius: 2,
							p: 0.75,
							border: "1px solid",
							borderColor: "grey.200",
						}}
					>
						<IconButton
							size="small"
							onClick={onDecrease}
							disabled={quantity === 0}
							sx={{
								width: 32,
								height: 32,
								bgcolor: "background.paper",
								border: "1px solid",
								borderColor: "grey.300",
								"&:hover": {
									bgcolor: "grey.100",
									borderColor: "grey.400",
								},
								"&:disabled": {
									bgcolor: "grey.100",
									borderColor: "grey.200",
								},
							}}
						>
							<Remove fontSize="small" />
						</IconButton>

						<Typography
							variant="body1"
							fontWeight={700}
							sx={{
								minWidth: 36,
								textAlign: "center",
								fontSize: "1.1rem",
								color: quantity > 0 ? "primary.main" : "text.secondary",
							}}
						>
							{quantity}
						</Typography>

						<IconButton
							size="small"
							onClick={onIncrease}
							disabled={quantity >= availableRooms}
							sx={{
								width: 32,
								height: 32,
								bgcolor: "primary.main",
								color: "white",
								"&:hover": {
									bgcolor: "primary.dark",
								},
								"&:disabled": {
									bgcolor: "grey.200",
									color: "grey.400",
								},
							}}
						>
							<Add fontSize="small" />
						</IconButton>
					</Box>
				</Box>
			</Box>
		</Paper>
	);
};
