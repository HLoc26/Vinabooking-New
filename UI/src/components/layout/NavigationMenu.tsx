import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams, matchPath } from "react-router-dom";
import { List, ListItem, ListItemIcon, ListItemText, ListItemButton, Collapse, Box, Typography } from "@mui/material";

// Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import BookingIcon from "@mui/icons-material/BookOnline";
import PriceIcon from "@mui/icons-material/PriceChange";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

// Hooks & Child Components
import { useOwnerAccommodations } from "../../features/owner/hooks/useOwnerAccommodations";
import { useAccommodationSidebarData } from "../../features/owner/hooks/useAccommodationSidebarData";
import { AccommodationTreeMenu } from "../../features/owner/components/dashboard/AccommodationTreeMenu";

const navItems = [
	{ label: "Manage Booking", icon: <BookingIcon fontSize="small" />, path: "/owner/manage-booking" },
	{ label: "Manage Price", icon: <PriceIcon fontSize="small" />, path: "/owner/manage-price" },
];

export const NavigationMenu = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();

	// Data Hooks
	const { data: accommodations } = useOwnerAccommodations();

	const activeAccMatch = matchPath({ path: "/owner/accommodations/:id" }, location.pathname);
	const activeAccommodationId = activeAccMatch?.params?.id;

	const { data: activeAccSidebarData } = useAccommodationSidebarData(activeAccommodationId);

	// Local State
	const [openAccommodations, setOpenAccommodations] = useState(false);
	const [expandedAccId, setExpandedAccId] = useState<string | null>(null);

	// Auto-expand logic
	useEffect(() => {
		if (location.pathname.includes("/owner/accommodations/") || location.pathname === "/owner/dashboard") {
			setOpenAccommodations(true);
		}
		if (activeAccommodationId) {
			setExpandedAccId(activeAccommodationId);
		}
	}, [location.pathname, activeAccommodationId]);

	const currentTab = searchParams.get("tab") || "overview";
	const selectedRoomId = searchParams.get("roomId");

	const handleTreeTabChange = (newTab: string, roomId?: string) => {
		if (!activeAccommodationId) return;
		let url = `/owner/accommodations/${activeAccommodationId}?tab=${newTab}`;
		if (roomId) url += `&roomId=${roomId}`;
		navigate(url, { replace: true });
	};

	const getNavItemStyle = () => ({
		borderRadius: 2,
		py: 1,
		mb: 0.5,
		"&.Mui-selected": {
			bgcolor: "primary.main",
			color: "primary.contrastText",
			"& .MuiListItemIcon-root": { color: "primary.contrastText" },
			"&:hover": { bgcolor: "primary.dark" },
		},
		"&:hover:not(.Mui-selected)": { bgcolor: "action.hover" },
	});

	return (
		<Box sx={{ flexGrow: 1, overflowY: "auto", px: 1.5, pt: 0.5, pb: 2 }}>
			<List disablePadding>
				{/* 1. My Accommodations (dynamic tree) */}
				<ListItem disablePadding sx={{ mb: 0.5, display: "block" }}>
					<ListItemButton
						onClick={() => {
							setOpenAccommodations(!openAccommodations);
							if (location.pathname !== "/owner/dashboard") navigate("/owner/dashboard");
						}}
						selected={location.pathname === "/owner/dashboard"}
						sx={getNavItemStyle()}
					>
						<ListItemIcon sx={{ minWidth: 36, color: location.pathname === "/owner/dashboard" ? "inherit" : "text.secondary" }}>
							<DashboardIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText
							primary={
								<Typography fontSize={14} fontWeight={location.pathname === "/owner/dashboard" ? 600 : 400}>
									My Accommodations
								</Typography>
							}
						/>
						{openAccommodations ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
					</ListItemButton>

					<Collapse in={openAccommodations} timeout="auto" unmountOnExit>
						<List component="div" disablePadding sx={{ mt: 0.5 }}>
							{accommodations?.map((acc) => {
								const isAccActive = activeAccommodationId === acc.id;
								const isExpanded = expandedAccId === acc.id;

								return (
									<Box key={acc.id} sx={{ mb: 0.5 }}>
										<ListItemButton
											onClick={() => {
												setExpandedAccId(isExpanded ? null : acc.id);
												if (!isAccActive) navigate(`/owner/accommodations/${acc.id}?tab=overview`);
											}}
											sx={{
												...getNavItemStyle(),
												pl: 4,
												py: 0.5,
												bgcolor: isAccActive ? "action.selected" : "transparent",
												"&:hover": { bgcolor: "action.hover" },
											}}
										>
											<ListItemIcon sx={{ minWidth: 28, color: isAccActive ? "primary.main" : "text.secondary" }}>
												<ArrowRightIcon fontSize="small" sx={{ transform: isExpanded ? "rotate(90deg)" : "none", transition: "0.2s" }} />
											</ListItemIcon>
											<ListItemText
												primary={
													<Typography fontSize={13} fontWeight={isAccActive ? 600 : 400} color={isAccActive ? "primary.main" : "text.primary"} noWrap>
														{acc.name}
													</Typography>
												}
											/>
										</ListItemButton>

										<Collapse in={isExpanded} timeout="auto" unmountOnExit>
											<Box sx={{ pl: 3.5, borderLeft: "1px dashed", borderColor: "divider", ml: 4, mt: 0.5, mb: 1 }}>
												<AccommodationTreeMenu
													rooms={activeAccSidebarData?.id === acc.id ? activeAccSidebarData?.rooms : []}
													activeTab={isAccActive ? currentTab : ""}
													activeRoomId={isAccActive ? selectedRoomId : null}
													onTabChange={handleTreeTabChange}
												/>
											</Box>
										</Collapse>
									</Box>
								);
							})}
						</List>
					</Collapse>
				</ListItem>

				{/* 2. Manage Booking, Manage Price (static) */}
				{navItems.map(({ label, icon, path }) => {
					const isActive = location.pathname === path;
					return (
						<ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
							<ListItemButton onClick={() => navigate(path)} selected={isActive} sx={getNavItemStyle()}>
								<ListItemIcon sx={{ minWidth: 36, color: isActive ? "inherit" : "text.secondary" }}>{icon}</ListItemIcon>
								<ListItemText
									primary={
										<Typography fontSize={14} fontWeight={isActive ? 600 : 400}>
											{label}
										</Typography>
									}
								/>
							</ListItemButton>
						</ListItem>
					);
				})}
			</List>
		</Box>
	);
};
