import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";
import { StarOutlineRounded } from "@mui/icons-material";

export const tabs = [
	{ label: "Profile", icon: <PersonOutlineOutlinedIcon /> },
	{ label: "Bookings", icon: <LuggageOutlinedIcon /> },
	{ label: "Favourite List", icon: <StarOutlineRounded /> },
] as const;
