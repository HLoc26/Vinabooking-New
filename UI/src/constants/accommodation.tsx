import HotelIcon from "@mui/icons-material/Hotel";
import ApartmentIcon from "@mui/icons-material/Apartment";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import BreakfastDiningIcon from "@mui/icons-material/BreakfastDining";
import ForestIcon from "@mui/icons-material/Forest";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import AgriculturalIcon from "@mui/icons-material/Agriculture"; // farm
import LocationOnIcon from "@mui/icons-material/LocationOn";

// Accommodation types with icon
export const accommodationTypes = [
	{ label: "Hotel", type: "hotel", enum: "HOTEL", icon: <HotelIcon fontSize="small" /> },
	{ label: "Apartment", type: "apartment", enum: "APARTMENT", icon: <ApartmentIcon fontSize="small" /> },
	{ label: "Villa", type: "villa", enum: "VILLA", icon: <HomeIcon fontSize="small" /> },
	{ label: "Vacation Home", type: "vacation_home", enum: "VACATION_HOME", icon: <HomeIcon fontSize="small" /> },
	{ label: "Guesthouse", type: "guesthouse", enum: "GUESTHOUSE", icon: <HomeIcon fontSize="small" /> },
	{ label: "Hostel", type: "hostel", enum: "HOSTEL", icon: <GroupIcon fontSize="small" /> },
	{ label: "Bed & Breakfast", type: "bed_and_breakfast", enum: "BED_AND_BREAKFAST", icon: <BreakfastDiningIcon fontSize="small" /> },
	{ label: "Homestay", type: "homestay", enum: "HOMESTAY", icon: <HomeIcon fontSize="small" /> },
	{ label: "Campground", type: "campground", enum: "CAMPGROUND", icon: <ForestIcon fontSize="small" /> },
	{ label: "Country House", type: "country_house", enum: "COUNTRY_HOUSE", icon: <HomeIcon fontSize="small" /> },
	{ label: "Boat", type: "boat", enum: "BOAT", icon: <DirectionsBoatIcon fontSize="small" /> },
	{ label: "Luxury Tent", type: "luxury_tent", enum: "LUXURY_TENT", icon: <ForestIcon fontSize="small" /> },
	{ label: "Cabin", type: "cabin", enum: "CABIN", icon: <HomeIcon fontSize="small" /> },
	{ label: "Motel", type: "motel", enum: "MOTEL", icon: <HotelIcon fontSize="small" /> },
	{ label: "Resort", type: "resort", enum: "RESORT", icon: <BeachAccessIcon fontSize="small" /> },
	{ label: "Farmstay", type: "farmstay", enum: "FARMSTAY", icon: <AgriculturalIcon fontSize="small" /> },
	{ label: "Capsule Hotel", type: "capsule_hotel", enum: "CAPSULE_HOTEL", icon: <HotelIcon fontSize="small" /> },
	{ label: "Treehouse", type: "treehouse", enum: "TREEHOUSE", icon: <ForestIcon fontSize="small" /> },
	{ label: "Townhouse", type: "townhouse", enum: "TOWNHOUSE", icon: <ApartmentIcon fontSize="small" /> },
	{ label: "Other", type: "other", enum: "OTHER", icon: <LocationOnIcon fontSize="small" /> },
];
