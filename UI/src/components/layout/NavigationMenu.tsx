import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams, matchPath } from "react-router-dom";
import { Collapse, Box, Typography } from "@mui/material";

// Icons
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import BookingIcon from "@mui/icons-material/BookOnlineOutlined";
import PriceIcon from "@mui/icons-material/PriceChangeOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FolderIcon from "@mui/icons-material/FolderOutlined";

// Hooks & Child Components
import { useOwnerAccommodations } from "../../features/owner/hooks/useOwnerAccommodations";
import { AccommodationTreeMenu } from "../../features/owner/components/dashboard/AccommodationTreeMenu";

const navItems = [
	{ label: "Manage Booking", icon: <BookingIcon fontSize="inherit" />, path: "/owner/manage-booking" },
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
	borderRadius: "6px",
	cursor: "pointer",
	transition: "all 0.15s ease-in-out",
	color: isActive ? "text.primary" : "text.secondary",
	bgcolor: isActive ? "rgba(255,255,255,0.06)" : "transparent",
	position: "relative",
	"&:hover": {
		bgcolor: isActive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
		color: "text.primary",
	},
});

export const NavigationMenu = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();

	// Data Hooks
	const { data: accommodations } = useOwnerAccommodations();

	const activeAccMatch = matchPath({ path: "/owner/accommodations/:id" }, location.pathname);
	const activeAccommodationId = activeAccMatch?.params?.id;
	const activeBookingStatus = searchParams.get("status") || "BOOKED";

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
				<Box sx={{ display: "flex", alignItems: "center", fontSize: "1.1rem", color: location.pathname === "/owner/dashboard" ? "primary.main" : "inherit" }}>
					<DashboardIcon fontSize="inherit" />
				</Box>
				<Typography sx={{ fontSize: "0.85rem", fontWeight: location.pathname === "/owner/dashboard" ? 600 : 500, flexGrow: 1, userSelect: "none" }}>My Accommodations</Typography>
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
									<Box sx={{ display: "flex", alignItems: "center", fontSize: "1rem", color: isAccActive ? "primary.main" : "inherit" }}>
										<FolderIcon fontSize="inherit" />
									</Box>
									<Typography
										sx={{
											fontSize: "0.8rem",
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
				</Box>
			</Collapse>

			{/* 2. Manage Booking, Manage Price (static) */}
			{navItems.map(({ label, icon, path }) => {
				const isBookingItem = path === "/owner/manage-booking";
				const isActive = location.pathname === path;

				return (
					<Box key={path}>
						<Box onClick={() => navigate(isBookingItem ? `${path}?status=BOOKED` : path)} sx={getModernNavItemStyle(isActive)}>
							<Box sx={{ display: "flex", alignItems: "center", fontSize: "1.1rem", color: isActive ? "primary.main" : "inherit" }}>{icon}</Box>
							<Typography sx={{ fontSize: "0.85rem", fontWeight: isActive ? 600 : 500, userSelect: "none" }}>{label}</Typography>
						</Box>

						{isBookingItem && (
							<Collapse in={isActive} timeout="auto" unmountOnExit>
								<Box sx={{ ml: 4.5, pl: 1, borderLeft: "1px solid", borderColor: "rgba(255,255,255,0.08)", mt: 0.5, mb: 1 }}>
									{bookingStatusItems.map((item) => {
										const isStatusActive = isActive && activeBookingStatus === item.status;
										return (
											<Box
												key={item.status}
												onClick={() => navigate(`${path}?status=${item.status}`)}
												sx={{
													...getModernNavItemStyle(isStatusActive),
													ml: 0,
													mr: 1.5,
													py: 0.6,
												}}
											>
												<Typography
													sx={{
														fontSize: "0.8rem",
														fontWeight: isStatusActive ? 600 : 400,
														color: isStatusActive ? "text.primary" : "text.secondary",
														userSelect: "none",
													}}
												>
													{item.label}
												</Typography>
											</Box>
										);
									})}
								</Box>
							</Collapse>
						)}
					</Box>
				);
			})}
		</Box>
	);
};
