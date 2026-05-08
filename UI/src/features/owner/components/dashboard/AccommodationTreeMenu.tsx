import { useState, useEffect } from "react";
import { List, ListItemButton, ListItemIcon, ListItemText, Collapse, Box, Typography } from "@mui/material";
import { InfoOutlined, WeekendOutlined, MeetingRoomOutlined, StarBorderOutlined, ExpandLess, ExpandMore, SubdirectoryArrowRight } from "@mui/icons-material";

interface AccommodationTreeMenuProps {
	rooms?: { id: string; name: string }[];
	activeTab: string;
	activeRoomId: string | null;
	onTabChange: (tab: string, roomId?: string) => void;
}

export const AccommodationTreeMenu = ({ rooms = [], activeTab, activeRoomId, onTabChange }: AccommodationTreeMenuProps) => {
	const [openRooms, setOpenRooms] = useState(false);

	useEffect(() => {
		if (activeTab === "rooms" || activeTab === "roomDetail") {
			setOpenRooms(true);
		}
	}, [activeTab]);

	const handleToggleRooms = (e: React.MouseEvent) => {
		e.stopPropagation();
		setOpenRooms(!openRooms);
	};

	const getListItemStyle = (isNested: boolean = false) => ({
		borderRadius: 2,
		mb: 0.5,
		pl: isNested ? 4 : 2,
		py: 1,
		"&.Mui-selected": {
			bgcolor: "primary.main",
			color: "primary.contrastText",
			"& .MuiListItemIcon-root": { color: "primary.contrastText" },
			"&:hover": { bgcolor: "primary.dark" },
		},
		"&:hover:not(.Mui-selected)": {
			bgcolor: "action.hover",
		},
	});

	return (
		<List sx={{ px: 0, pt: 0 }}>
			{/* 1. OVERVIEW */}
			<ListItemButton selected={activeTab === "overview"} onClick={() => onTabChange("overview")} sx={getListItemStyle()}>
				<ListItemIcon sx={{ minWidth: 36, color: activeTab === "overview" ? "inherit" : "text.secondary" }}>
					<InfoOutlined fontSize="small" />
				</ListItemIcon>
				<ListItemText
					primary={
						<Typography fontSize={14} fontWeight={activeTab === "overview" ? 600 : 500}>
							Overview
						</Typography>
					}
				/>
			</ListItemButton>

			{/* 2. FACILITIES */}
			<ListItemButton selected={activeTab === "facilities"} onClick={() => onTabChange("facilities")} sx={getListItemStyle()}>
				<ListItemIcon sx={{ minWidth: 36, color: activeTab === "facilities" ? "inherit" : "text.secondary" }}>
					<WeekendOutlined fontSize="small" />
				</ListItemIcon>
				<ListItemText
					primary={
						<Typography fontSize={14} fontWeight={activeTab === "facilities" ? 600 : 500}>
							Facilities
						</Typography>
					}
				/>
			</ListItemButton>

			{/* 3. ROOMS */}
			<ListItemButton selected={activeTab === "rooms"} onClick={() => onTabChange("rooms")} sx={getListItemStyle()}>
				<ListItemIcon sx={{ minWidth: 36, color: activeTab === "rooms" ? "inherit" : "text.secondary" }}>
					<MeetingRoomOutlined fontSize="small" />
				</ListItemIcon>
				<ListItemText
					primary={
						<Typography fontSize={14} fontWeight={activeTab === "rooms" ? 600 : 500}>
							Rooms Management
						</Typography>
					}
				/>
				<Box onClick={handleToggleRooms} sx={{ display: "flex", alignItems: "center", p: 0.5, borderRadius: "50%", "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }}>
					{openRooms ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
				</Box>
			</ListItemButton>

			{/* Danh sách các phòng cụ thể */}
			<Collapse in={openRooms} timeout="auto" unmountOnExit>
				<List component="div" disablePadding>
					{rooms.map((room) => {
						const isRoomActive = activeTab === "roomDetail" && activeRoomId === room.id;
						return (
							<ListItemButton key={room.id} selected={isRoomActive} onClick={() => onTabChange("roomDetail", room.id)} sx={getListItemStyle(true)}>
								<ListItemIcon sx={{ minWidth: 32, color: isRoomActive ? "inherit" : "text.disabled" }}>
									<SubdirectoryArrowRight sx={{ fontSize: 18 }} />
								</ListItemIcon>
								<ListItemText
									primary={
										<Typography fontSize={13} fontWeight={isRoomActive ? 600 : 400} noWrap>
											{room.name}
										</Typography>
									}
								/>
							</ListItemButton>
						);
					})}
				</List>
			</Collapse>

			{/* 4. REVIEWS */}
			<ListItemButton selected={activeTab === "reviews"} onClick={() => onTabChange("reviews")} sx={getListItemStyle()}>
				<ListItemIcon sx={{ minWidth: 36, color: activeTab === "reviews" ? "inherit" : "text.secondary" }}>
					<StarBorderOutlined fontSize="small" />
				</ListItemIcon>
				<ListItemText
					primary={
						<Typography fontSize={14} fontWeight={activeTab === "reviews" ? 600 : 500}>
							Guest Reviews
						</Typography>
					}
				/>
			</ListItemButton>
		</List>
	);
};
