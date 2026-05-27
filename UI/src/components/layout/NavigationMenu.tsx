import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams, matchPath } from "react-router-dom";
import { Collapse, Box, Typography, List, ListItemButton, ListItemText } from "@mui/material";

// Icons
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import BookingIcon from "@mui/icons-material/BookOnlineOutlined";
import PriceIcon from "@mui/icons-material/PriceChangeOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FolderIcon from "@mui/icons-material/FolderOutlined";
import DraftsIcon from "@mui/icons-material/HistoryEduOutlined";

// Hooks & Child Components
import { useOwnerAccommodations } from "../../features/owner/hooks/useOwnerAccommodations";
import { AccommodationTreeMenu } from "../../features/owner/components/dashboard/AccommodationTreeMenu";

const navItems = [
	{ label: "Manage Booking", icon: <BookingIcon fontSize="inherit" />, path: "/owner/manage-booking", hasSubItems: true },
	{ label: "Manage Price", icon: <PriceIcon fontSize="inherit" />, path: "/owner/manage-price" },
];

const bookingStatusItems = [
	{ label: "Incoming", status: "BOOKED" },
	{ label: "Cancelled", status: "CANCELLED" },
	{ label: "Completed", status: "COMPLETED" },
];

const getModernNavItemStyle = (isActive: boolean) => ({
	display: "flex",
	alignItems: "center",
	gap: 1.5,
	px: 1.5,
	py: 0.85,
	mx: 1.5,
	mb: 0.5,
	borderRadius: "8px",
	cursor: "pointer",
	transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
	color: isActive ? "primary.main" : "text.secondary",
	bgcolor: isActive ? "rgba(var(--mui-palette-primary-mainChannel) / 0.08)" : "transparent",
	position: "relative",
	"&:hover": {
		bgcolor: isActive ? "rgba(var(--mui-palette-primary-mainChannel) / 0.12)" : "rgba(255,255,255,0.03)",
		color: isActive ? "primary.main" : "text.primary",
	},
	"&::before": isActive
		? {
				content: '""',
				position: "absolute",
				left: 0,
				top: "20%",
				bottom: "20%",
				width: "3px",
				bgcolor: "primary.main",
				borderRadius: "0 4px 4px 0",
			}
		: {},
});

export const NavigationMenu = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();

	// Data Hooks
	const { data: accommodations } = useOwnerAccommodations();

	const activeAccMatch = matchPath({ path: "/owner/accommodations/:accommodationId" }, location.pathname);
	const activeAccommodationId = activeAccMatch?.params?.accommodationId;

	// Local State
	const [openAccommodations, setOpenAccommodations] = useState(true);
	const [expandedAccId, setExpandedAccId] = useState<string | null>(null);

	// Auto-expand logic
	useEffect(() => {
		if (location.pathname.includes("/owner/accommodations/") || location.pathname === "/owner/dashboard" || location.pathname === "/owner/drafts") {
			setOpenAccommodations(true);
		}
		if (activeAccommodationId) {
			setExpandedAccId(activeAccommodationId);
		}
	}, [location.pathname, activeAccommodationId]);

	const currentTab = searchParams.get("tab") || "overview";
	const activeBookingStatus = searchParams.get("status") || "BOOKED";

	const handleTreeTabChange = (newTab: string) => {
		if (!activeAccommodationId) return;
		navigate(`/owner/accommodations/${activeAccommodationId}?tab=${newTab}`, { replace: true });
	};

	return (
		<Box sx={{ flexGrow: 1, overflowY: "auto", pt: 1, pb: 2 }}>
			{/* 1. My Accommodations (dynamic tree) */}
			<Box
				onClick={() => {
					setOpenAccommodations(!openAccommodations);
					if (location.pathname !== "/owner/dashboard") navigate("/owner/dashboard");
				}}
				sx={getModernNavItemStyle(location.pathname === "/owner/dashboard")}
			>
				<Box sx={{ display: "flex", alignItems: "center", fontSize: "1.2rem" }}>
					<DashboardIcon fontSize="inherit" />
				</Box>
				<Typography sx={{ fontSize: "0.875rem", fontWeight: location.pathname === "/owner/dashboard" ? 600 : 500, flexGrow: 1, userSelect: "none" }}>My Accommodations</Typography>
				<Box sx={{ display: "flex", alignItems: "center", color: "text.disabled", transform: openAccommodations ? "rotate(180deg)" : "rotate(0deg)", transition: "0.2s" }}>
					<ExpandMoreIcon fontSize="small" />
				</Box>
			</Box>

			<Collapse in={openAccommodations} timeout="auto" unmountOnExit>
				<Box sx={{ mt: 0.5, mb: 1.5 }}>
					{accommodations?.map((acc) => {
						const isAccActive = activeAccommodationId === acc.id;
						const isExpanded = expandedAccId === acc.id;

						return (
							<Box key={acc.id} sx={{ mb: 0.5 }}>
								<Box
									onClick={() => {
										setExpandedAccId(isExpanded ? null : acc.id);
										if (!isAccActive) navigate(`/owner/accommodations/${acc.id}?tab=overview`);
									}}
									sx={{
										...getModernNavItemStyle(isAccActive),
										ml: 3,
										py: 0.6,
										mx: 1.5,
										mr: 1.5,
									}}
								>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											color: isAccActive ? "primary.main" : "text.disabled",
											transform: isExpanded ? "rotate(90deg)" : "none",
											transition: "0.2s",
											ml: -0.5,
										}}
									>
										<ChevronRightIcon fontSize="small" />
									</Box>
									<Box sx={{ display: "flex", alignItems: "center", fontSize: "1.1rem", color: isAccActive ? "primary.main" : "inherit" }}>
										<FolderIcon fontSize="inherit" />
									</Box>
									<Typography
										sx={{
											fontSize: "0.825rem",
											fontWeight: isAccActive ? 600 : 500,
											color: isAccActive ? "text.primary" : "inherit",
											whiteSpace: "nowrap",
											overflow: "hidden",
											textOverflow: "ellipsis",
											userSelect: "none",
										}}
									>
										{acc.name}
									</Typography>
								</Box>

								<Collapse in={isExpanded} timeout="auto" unmountOnExit>
									<Box sx={{ ml: 4.5, pl: 1, borderLeft: "1px solid", borderColor: "rgba(255,255,255,0.08)", mt: 0.5, mb: 1 }}>
										<AccommodationTreeMenu activeTab={isAccActive ? currentTab : ""} onTabChange={handleTreeTabChange} />
									</Box>
								</Collapse>
							</Box>
						);
					})}

					<Box
						onClick={() => navigate("/owner/drafts")}
						sx={{
							...getModernNavItemStyle(location.pathname === "/owner/drafts"),
							ml: 3,
							py: 0.6,
							mx: 1.5,
							mr: 1.5,
						}}
					>
						<Box sx={{ width: 20 }} />
						<Box sx={{ display: "flex", alignItems: "center", fontSize: "1.1rem" }}>
							<DraftsIcon fontSize="inherit" />
						</Box>
						<Typography
							sx={{
								fontSize: "0.825rem",
								fontWeight: location.pathname === "/owner/drafts" ? 600 : 500,
								userSelect: "none",
							}}
						>
							Drafts
						</Typography>
					</Box>
				</Box>
			</Collapse>

			{/* 2. Manage Booking, Manage Price */}
			{navItems.map(({ label, icon, path, hasSubItems }) => {
				const isActive = location.pathname === path;
				const isBookingItem = label === "Manage Booking";

				return (
					<Box key={path}>
						<Box onClick={() => navigate(isBookingItem ? `${path}?status=BOOKED` : path)} sx={getModernNavItemStyle(isActive)}>
							<Box sx={{ display: "flex", alignItems: "center", fontSize: "1.2rem" }}>{icon}</Box>
							<Typography sx={{ fontSize: "0.875rem", fontWeight: isActive ? 600 : 500, userSelect: "none" }}>{label}</Typography>
						</Box>

						{hasSubItems && isBookingItem && isActive && (
							<List dense disablePadding sx={{ mb: 1, ml: 4.5, pl: 1, borderLeft: "1px solid", borderColor: "rgba(255,255,255,0.08)" }}>
								{bookingStatusItems.map((item) => {
									const isStatusActive = activeBookingStatus === item.status;
									return (
										<ListItemButton
											key={item.status}
											onClick={() => navigate(`${path}?status=${item.status}`)}
											sx={{
												py: 0.5,
												px: 1.5,
												borderRadius: "6px",
												mb: 0.25,
												color: isStatusActive ? "primary.main" : "text.secondary",
												bgcolor: isStatusActive ? "rgba(var(--mui-palette-primary-mainChannel) / 0.08)" : "transparent",
												"&:hover": {
													bgcolor: isStatusActive ? "rgba(var(--mui-palette-primary-mainChannel) / 0.12)" : "rgba(255,255,255,0.03)",
													color: isStatusActive ? "primary.main" : "text.primary",
												},
											}}
										>
											<ListItemText
												primary={item.label}
												slotProps={{
													primary: {
														fontSize: "0.8rem",
														fontWeight: isStatusActive ? 600 : 500,
													},
												}}
											/>
										</ListItemButton>
									);
								})}
							</List>
						)}
					</Box>
				);
			})}
		</Box>
	);
};
