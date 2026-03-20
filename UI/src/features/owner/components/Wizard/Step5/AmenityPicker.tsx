import { Box, Typography, Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { AmenityConfigForm } from "../../../types/owner.types";
import { AMENITY_PRESETS } from "../../../const/RoomConst";

interface Props {
	selected: AmenityConfigForm[];
	onToggle: (amenity: AmenityConfigForm) => void;
}

export default function AmenityPicker({ selected, onToggle }: Props) {
	return (
		<Box>
			<Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1.5} sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
				Amenities
			</Typography>

			<Box display="flex" flexWrap="wrap" gap={1}>
				{AMENITY_PRESETS.map((amenity) => {
					const isSelected = selected.some((x) => x.amenityId === amenity.amenityId);
					return (
						<Chip
							key={amenity.amenityId}
							label={amenity.name}
							onClick={() => onToggle(amenity)}
							icon={isSelected ? <CheckCircleIcon /> : undefined}
							color={isSelected ? "primary" : "default"}
							variant={isSelected ? "filled" : "outlined"}
							sx={{ cursor: "pointer", transition: "all 0.2s" }}
						/>
					);
				})}
			</Box>
		</Box>
	);
}
