import HomeIcon from "@mui/icons-material/Home";
import WifiIcon from "@mui/icons-material/Wifi";
import PoolIcon from "@mui/icons-material/Pool";
import LocalParkingIcon from "@mui/icons-material/LocalParking";

export const EDIT_BG = "#261a0d";
export const EDIT_BORDER = "#f5a623";
export const EDIT_HOVER = "#362512";
export const EDIT_SHADOW = "rgba(0, 0, 0, 0.6)";

export const getFacilityIcon = (name: string) => {
	const key = name.toLowerCase();
	if (key.includes("wifi")) return WifiIcon;
	if (key.includes("pool")) return PoolIcon;
	if (key.includes("parking")) return LocalParkingIcon;
	return HomeIcon;
};
