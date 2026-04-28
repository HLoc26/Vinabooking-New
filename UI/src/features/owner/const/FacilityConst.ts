import HomeIcon from "@mui/icons-material/Home";
import WifiIcon from "@mui/icons-material/Wifi";
import PoolIcon from "@mui/icons-material/Pool";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import SmokeFreeIcon from "@mui/icons-material/SmokeFree";
import ElevatorIcon from "@mui/icons-material/Elevator";
import AccessibleIcon from "@mui/icons-material/Accessible";
import FreeBreakfastIcon from "@mui/icons-material/FreeBreakfast";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import RoomServiceIcon from "@mui/icons-material/RoomService";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import LocalLaundryServiceIcon from "@mui/icons-material/LocalLaundryService";
import LuggageIcon from "@mui/icons-material/Luggage";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import SpaIcon from "@mui/icons-material/Spa";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import PetsIcon from "@mui/icons-material/Pets";

export const EDIT_BG = "#261a0d";
export const EDIT_BORDER = "#f5a623";
export const EDIT_HOVER = "#362512";
export const EDIT_SHADOW = "rgba(0, 0, 0, 0.6)";

export const getFacilityIcon = (name: string) => {
	if (!name) return HomeIcon;
	const key = name.toLowerCase();

	// General & Accessibility
	if (key.includes("wifi")) return WifiIcon;
	if (key.includes("air conditioning")) return AcUnitIcon;
	if (key.includes("non-smoking")) return SmokeFreeIcon;
	if (key.includes("elevator")) return ElevatorIcon;
	if (key.includes("wheelchair")) return AccessibleIcon;

	// Food & Drink
	if (key.includes("breakfast")) return FreeBreakfastIcon;
	if (key.includes("restaurant")) return RestaurantIcon;
	if (key.includes("room service")) return RoomServiceIcon;

	// Services
	if (key.includes("24-hour") || key.includes("front desk")) return SupportAgentIcon;
	if (key.includes("laundry")) return LocalLaundryServiceIcon;
	if (key.includes("luggage")) return LuggageIcon;

	// Wellness & Recreation
	if (key.includes("pool")) return PoolIcon;
	if (key.includes("fitness")) return FitnessCenterIcon;
	if (key.includes("spa") || key.includes("wellness")) return SpaIcon;

	// Transport & Special Amenities
	if (key.includes("parking")) return LocalParkingIcon;
	if (key.includes("airport") || key.includes("shuttle")) return AirportShuttleIcon;
	if (key.includes("pet")) return PetsIcon;

	// Fallback
	return HomeIcon;
};
