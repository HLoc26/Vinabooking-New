import { Box, Typography } from "@mui/material";
import { InfoOutlined, WeekendOutlined, MeetingRoomOutlined, StarBorderOutlined, PhotoLibraryOutlined } from "@mui/icons-material";

type Props = Readonly<{
	activeTab: string;
	onTabChange: (tab: string) => void;
}>;

export const AccommodationTreeMenu = ({ activeTab, onTabChange }: Props) => {
	const getLeafStyle = (isActive: boolean) => ({
		display: "flex",
		alignItems: "center",
		gap: 1.25,
		pl: 1.5,
		pr: 1.5,
		py: 0.6,
		mb: 0.25,
		borderRadius: "6px",
		cursor: "pointer",
		transition: "all 0.15s ease",
		color: isActive ? "primary.main" : "text.secondary",
		bgcolor: isActive ? "rgba(var(--mui-palette-primary-mainChannel) / 0.1)" : "transparent",
		"&:hover": {
			bgcolor: isActive ? "rgba(var(--mui-palette-primary-mainChannel) / 0.15)" : "rgba(255,255,255,0.03)",
			color: isActive ? "primary.main" : "text.primary",
		},
	});

	return (
		<Box sx={{ display: "flex", flexDirection: "column" }}>
			{/* 1. OVERVIEW */}
			<Box onClick={() => onTabChange("overview")} sx={getLeafStyle(activeTab === "overview")}>
				<InfoOutlined sx={{ fontSize: 16 }} />
				<Typography sx={{ fontSize: "0.8rem", fontWeight: activeTab === "overview" ? 600 : 500, userSelect: "none" }}>Overview</Typography>
			</Box>

			{/* 2. FACILITIES */}
			<Box onClick={() => onTabChange("facilities")} sx={getLeafStyle(activeTab === "facilities")}>
				<WeekendOutlined sx={{ fontSize: 16 }} />
				<Typography sx={{ fontSize: "0.8rem", fontWeight: activeTab === "facilities" ? 600 : 500, userSelect: "none" }}>Facilities</Typography>
			</Box>

			{/* 3. ROOMS */}
			<Box onClick={() => onTabChange("rooms")} sx={getLeafStyle(activeTab === "rooms")}>
				<MeetingRoomOutlined sx={{ fontSize: 16 }} />
				<Typography sx={{ fontSize: "0.8rem", fontWeight: activeTab === "rooms" ? 600 : 500, userSelect: "none", flexGrow: 1 }}>Rooms</Typography>
			</Box>

			{/* 4. PHOTO GALLERY */}
			<Box onClick={() => onTabChange("gallery")} sx={getLeafStyle(activeTab === "gallery")}>
				<PhotoLibraryOutlined sx={{ fontSize: 16 }} />
				<Typography sx={{ fontSize: "0.8rem", fontWeight: activeTab === "gallery" ? 600 : 500, userSelect: "none" }}>Photo Gallery</Typography>
			</Box>

			{/* 5. GUEST REVIEWS */}
			<Box onClick={() => onTabChange("reviews")} sx={getLeafStyle(activeTab === "reviews")}>
				<StarBorderOutlined sx={{ fontSize: 16 }} />
				<Typography sx={{ fontSize: "0.8rem", fontWeight: activeTab === "reviews" ? 600 : 500, userSelect: "none" }}>Guest Reviews</Typography>
			</Box>
		</Box>
	);
};
