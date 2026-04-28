import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import KingBedOutlinedIcon from "@mui/icons-material/KingBedOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import type { SvgIconComponent } from "@mui/icons-material";

interface StepMeta {
	label: string;
	subtitle: string;
	icon: SvgIconComponent;
}

export const STEP_META: StepMeta[] = [
	{ label: "Basic Info", subtitle: "Name & description", icon: DescriptionOutlinedIcon },
	{ label: "Location", subtitle: "Where it is", icon: LocationOnOutlinedIcon },
	{ label: "Facilities", subtitle: "What you offer", icon: MeetingRoomOutlinedIcon },
	{ label: "Rooms", subtitle: "Rooms & beds", icon: KingBedOutlinedIcon },
	{ label: "Photos", subtitle: "Images & cover", icon: PhotoLibraryOutlinedIcon },
	{ label: "Preview", subtitle: "Review & publish", icon: VisibilityOutlinedIcon },
];
