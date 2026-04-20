import { Box, Typography, Paper } from "@mui/material";
// Importing from the top level to ensure compatibility
import Grid from "@mui/material/Grid";
import type { SvgIconComponent } from "@mui/icons-material";

// Icons
import ApartmentIcon from "@mui/icons-material/Apartment";
import HouseIcon from "@mui/icons-material/House";
import VillaIcon from "@mui/icons-material/Villa";
import HolidayVillageIcon from "@mui/icons-material/HolidayVillage";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import CabinIcon from "@mui/icons-material/Cabin";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import ParkIcon from "@mui/icons-material/Park";
import HotelIcon from "@mui/icons-material/Hotel";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import NightShelterIcon from "@mui/icons-material/NightShelter";
import OtherHousesIcon from "@mui/icons-material/OtherHouses";
import BreakfastDiningIcon from "@mui/icons-material/BreakfastDining";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import NaturePeopleIcon from "@mui/icons-material/NaturePeople";
import CropOriginalIcon from "@mui/icons-material/CropOriginal";
import GroupIcon from "@mui/icons-material/Group";
import ForestIcon from "@mui/icons-material/Forest";
import CategoryIcon from "@mui/icons-material/Category";

import { ERentalType, EAccommodationType } from "../../../accommodation/types/accommodation.types";

// ─── Types ─────────────────────────

interface AccomOption {
	value: EAccommodationType;
	label: string;
	icon: SvgIconComponent;
}

// ─── Options ───────────────────────

const optionsMap: Record<ERentalType, AccomOption[]> = {
	[ERentalType.ENTIRE_PLACE]: [
		{ value: EAccommodationType.APARTMENT, label: "Apartment", icon: ApartmentIcon },
		{ value: EAccommodationType.VILLA, label: "Villa", icon: VillaIcon },
		{ value: EAccommodationType.VACATION_HOME, label: "Vacation Home", icon: HolidayVillageIcon },
		{ value: EAccommodationType.TOWNHOUSE, label: "Townhouse", icon: LocationCityIcon },
		{ value: EAccommodationType.COUNTRY_HOUSE, label: "Country House", icon: HouseIcon },
		{ value: EAccommodationType.CABIN, label: "Cabin", icon: CabinIcon },
		{ value: EAccommodationType.BOAT, label: "Boat", icon: DirectionsBoatIcon },
		{ value: EAccommodationType.TREEHOUSE, label: "Treehouse", icon: ParkIcon },
	],
	[ERentalType.PRIVATE_ROOM]: [
		{ value: EAccommodationType.HOTEL, label: "Hotel", icon: HotelIcon },
		{ value: EAccommodationType.RESORT, label: "Resort", icon: BeachAccessIcon },
		{ value: EAccommodationType.MOTEL, label: "Motel", icon: NightShelterIcon },
		{ value: EAccommodationType.GUESTHOUSE, label: "Guesthouse", icon: OtherHousesIcon },
		{ value: EAccommodationType.BED_AND_BREAKFAST, label: "Bed & Breakfast", icon: BreakfastDiningIcon },
		{ value: EAccommodationType.HOMESTAY, label: "Homestay", icon: HouseIcon },
		{ value: EAccommodationType.FARMSTAY, label: "Farmstay", icon: AgricultureIcon },
		{ value: EAccommodationType.LUXURY_TENT, label: "Luxury Tent", icon: NaturePeopleIcon },
		{ value: EAccommodationType.CAPSULE_HOTEL, label: "Capsule Hotel", icon: CropOriginalIcon },
	],
	[ERentalType.SHARED_ROOM]: [
		{ value: EAccommodationType.HOSTEL, label: "Hostel", icon: GroupIcon },
		{ value: EAccommodationType.CAMPGROUND, label: "Campground", icon: ForestIcon },
		{ value: EAccommodationType.OTHER, label: "Other", icon: CategoryIcon },
	],
};

// ─── Component ─────────────────────

interface Props {
	rentalType: ERentalType | "";
	value: EAccommodationType | "";
	onChange: (val: EAccommodationType) => void;
}

export default function StepAccommodationTypeBox({ rentalType, value, onChange }: Props) {
	if (!rentalType) return null;

	const options = optionsMap[rentalType] ?? [];

	return (
		<Box>
			<Typography variant="h6" mb={3}>
				What kind of place are you listing?
			</Typography>

			<Grid container spacing={2}>
				{options.map((opt) => {
					const selected = value === opt.value;
					const Icon = opt.icon;

					return (
						<Grid
							key={opt.value}
							// In MUI v6, 'item' is removed. Use 'size' instead of 'xs', 'sm', etc.
							// If your version doesn't support 'size', use 'xs={12}' WITHOUT the 'item' prop.
							size={{ xs: 12, sm: 6, md: 4 }}
							sx={{ display: "flex" }}
						>
							<Paper
								onClick={() => onChange(opt.value)}
								elevation={selected ? 4 : 1}
								sx={{
									p: 3,
									borderRadius: 3,
									cursor: "pointer",
									border: "2px solid",
									borderColor: selected ? "primary.main" : "transparent",
									bgcolor: selected ? "action.selected" : "background.paper",
									transition: "all 0.2s ease",
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									textAlign: "center",
									width: "100%",
									minHeight: 140,
									"&:hover": {
										borderColor: "primary.main",
										boxShadow: 3,
										transform: "translateY(-2px)",
									},
								}}
							>
								<Icon
									fontSize="large"
									sx={{
										mb: 1,
										color: selected ? "primary.main" : "text.secondary",
									}}
								/>

								<Typography fontWeight={selected ? 700 : 600}>{opt.label}</Typography>
							</Paper>
						</Grid>
					);
				})}
			</Grid>
		</Box>
	);
}
