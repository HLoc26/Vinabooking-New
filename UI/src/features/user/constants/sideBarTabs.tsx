import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";
import StarRateOutlinedIcon from "@mui/icons-material/StarRateOutlined";

export const tabs = [
	{ label: "Profile", icon: <PersonOutlineOutlinedIcon /> },
	{ label: "Bookings", icon: <LuggageOutlinedIcon /> },
	{ label: "Favourite List", icon: <StarRateOutlinedIcon /> },
] as const;
