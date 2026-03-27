import { Box, Typography, Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useOwnerAmenities } from "../../../hooks/useOwnerAmenities";
import type { AmenityDto, AmenityConfigForm } from "../../../types/owner.types";

interface Props {
	selected: AmenityConfigForm[];
	onToggle: (amenity: AmenityConfigForm) => void;
}

export default function AmenityPicker({ selected, onToggle }: Props) {
	const { amenities, isLoading } = useOwnerAmenities();

	const mapAmenityToForm = (a: AmenityDto): AmenityConfigForm => ({
		amenityId: a.id,
		name: a.name,
		type: a.type,
		note: "",
	});

	if (isLoading) return <Typography>Loading amenities...</Typography>;

	return (
		<Box>
			<Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1.5} sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
				Amenities
			</Typography>

			<Box display="flex" flexWrap="wrap" gap={1}>
				{amenities.map((a) => {
					const isSelected = selected.some((x) => x.amenityId === a.id);

					return (
						<Chip
							key={a.id}
							label={a.name}
							onClick={() => onToggle(mapAmenityToForm(a))}
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
