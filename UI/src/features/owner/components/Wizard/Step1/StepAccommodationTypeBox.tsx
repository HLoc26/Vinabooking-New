import { Box, Typography, Paper, Stack } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

// Property icons
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

import { ERentalType, EAccommodationType } from "../../../../accommodation/types/accommodation.types";
import { AccommodationToRentalMap } from "../../../../accommodation/types/const";

// ─── Option map: rental type → list of accommodation options ─────────────────

interface AccomOption {
	value: EAccommodationType;
	label: string;
	icon: SvgIconComponent;
}

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

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
	rentalType: ERentalType | "";
	value: EAccommodationType | "";
	onChange: (val: EAccommodationType) => void;
}

export default function StepAccommodationTypeBox({ rentalType, value, onChange }: Props) {
	if (!rentalType) return null;

	const options = optionsMap[rentalType as ERentalType] ?? [];

	return (
		<Box>
			<Typography variant="h6" mb={3}>
				What kind of place are you listing?
			</Typography>

			<Stack spacing={2}>
				{options.map((opt) => {
					const selected = value === opt.value;
					const Icon = opt.icon;

					// Derive the rental type this accommodation maps to — used as a
					// subtle hint so the owner sees the relationship is correct.
					const mappedRental = AccommodationToRentalMap[opt.value];
					const rentalLabel =
						mappedRental === ERentalType.ENTIRE_PLACE
							? "Entire place"
							: mappedRental === ERentalType.PRIVATE_ROOM
								? "Private room"
								: mappedRental === ERentalType.SHARED_ROOM
									? "Shared room"
									: null;

					return (
						<Paper
							key={opt.value}
							onClick={() => onChange(opt.value)}
							elevation={selected ? 4 : 1}
							sx={{
								p: 3,
								borderRadius: 3,
								cursor: "pointer",
								border: "2px solid",
								borderColor: selected ? "#1976d2" : "transparent",
								bgcolor: selected ? "rgba(25, 118, 210, 0.05)" : "background.paper",
								transition: "all 0.25s ease",
								display: "flex",
								gap: 2,
								alignItems: "flex-start",
								"&:hover": {
									borderColor: "#1976d2",
									boxShadow: 3,
									bgcolor: "rgba(25, 118, 210, 0.04)",
								},
							}}
						>
							<Box
								sx={{
									mt: 0.5,
									color: selected ? "primary.main" : "text.secondary",
									transition: "color 0.25s ease",
								}}
							>
								<Icon />
							</Box>

							<Box flex={1}>
								<Typography variant="subtitle1" fontWeight={selected ? 700 : 600} color={selected ? "primary.main" : "text.primary"} sx={{ transition: "all 0.25s ease" }}>
									{opt.label}
								</Typography>
								{rentalLabel && (
									<Typography variant="caption" color="text.disabled">
										{rentalLabel}
									</Typography>
								)}
							</Box>
						</Paper>
					);
				})}
			</Stack>
		</Box>
	);
}
