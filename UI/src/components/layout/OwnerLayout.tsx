import { useEffect, useState, useRef, useCallback, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { setOwnerProfile, logoutSuccess } from "../../features/auth/authSlice";
import { authStorage } from "../../features/auth/utils/authStorage";
import { useOwnerInfo } from "../../features/owner/hooks/useOwnerInfo";
import { CircularProgress, Box, Drawer, Typography, Divider, Button, Avatar, Tooltip, Chip } from "@mui/material";
import { usePushNotificationContext } from "../../context/PushNotification/hook";
import { NavigationMenu } from "./NavigationMenu";

// Icons
import LogoutIcon from "@mui/icons-material/Logout";
import HotelIcon from "@mui/icons-material/Hotel";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

interface OwnerLayoutProps {
	children: ReactNode;
}

const MIN_DRAWER_WIDTH = 260;
const MAX_DRAWER_WIDTH = 500;

const bookingStatusItems = [
	{ label: "Incoming", status: "BOOKED" },
	{ label: "Cancelled", status: "CANCELLED" },
	{ label: "Completed", status: "COMPLETED" },
];

export const OwnerLayout: React.FC<OwnerLayoutProps> = ({ children }) => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const user = useSelector((root: RootState) => root.auth.user);
	const { pushNotification } = usePushNotificationContext();
	const { data: ownerInfo, isLoading, isError, error } = useOwnerInfo();

	const isNotOwner = user?.role !== "ACCOMMODATION_OWNER";

	// --- RESIZABLE SIDEBAR ---
	const [drawerWidth, setDrawerWidth] = useState(() => {
		const savedWidth = localStorage.getItem("vinabooking_sidebar_width");
		return savedWidth ? Number.parseInt(savedWidth, 10) : MIN_DRAWER_WIDTH;
	});
	const isResizing = useRef(false);
	const drawerRef = useRef<HTMLDivElement>(null);

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		isResizing.current = true;
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
	}, []);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!isResizing.current) return;
			const newWidth = Math.min(MAX_DRAWER_WIDTH, Math.max(MIN_DRAWER_WIDTH, e.clientX));
			if (drawerRef.current) {
				drawerRef.current.style.setProperty("--drawer-width", `${newWidth}px`);
			}
		};

		const handleMouseUp = (e: MouseEvent) => {
			if (!isResizing.current) return;
			isResizing.current = false;
			document.body.style.cursor = "default";
			document.body.style.userSelect = "auto";

			// Commit state only on release
			const finalWidth = Math.min(MAX_DRAWER_WIDTH, Math.max(MIN_DRAWER_WIDTH, e.clientX));
			setDrawerWidth(finalWidth);
			localStorage.setItem("vinabooking_sidebar_width", finalWidth.toString());
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, []);
	// -------------------------------------------

	useEffect(() => {
		if (isNotOwner) {
			navigate("/owner/landing", { replace: true });
			return;
		}
		if (isLoading) return;
		if (isError && error?.response?.status === 404) {
			pushNotification("Please complete your profile to continue.", "info");
			navigate("/owner/onboard", { replace: true });
			return;
		}
		if (isError && error?.response?.status === 403) {
			pushNotification("Access denied. Please check your permissions.", "error");
			navigate("/owner/landing", { replace: true });
			return;
		}
		if (ownerInfo) {
			dispatch(setOwnerProfile(ownerInfo));
		}
	}, [isNotOwner, ownerInfo, isLoading, isError, error, navigate, dispatch, pushNotification]);

	if (isNotOwner) return null;

	if (isLoading || !ownerInfo) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
				<CircularProgress />
			</Box>
		);
	}

	const handleLogout = () => {
		authStorage.clearAccessToken();
		authStorage.clearUser();
		dispatch(logoutSuccess());
		navigate("/owner/login");
	};

	const avatarLetter = user?.email?.[0]?.toUpperCase() ?? "O";
	const activeBookingStatus = new URLSearchParams(location.search).get("status") ?? "BOOKED";

	return (
		<Box sx={{ display: "flex" }}>
			<Drawer
				variant="permanent"
				anchor="left"
				slotProps={{ paper: { ref: drawerRef } }}
				sx={{
					"--drawer-width": `${drawerWidth}px`,
					width: "var(--drawer-width)",
					flexShrink: 0,
					"& .MuiDrawer-paper": {
						width: "var(--drawer-width)",
						boxSizing: "border-box",
						display: "flex",
						flexDirection: "column",
						borderRight: "1px solid",
						borderColor: "divider",
						transition: "width 0.1s ease",
						overflow: "visible", // Để thanh kéo thò ra ngoài một xíu dễ nắm
						"& ::-webkit-scrollbar": { width: "4px" },
						"& ::-webkit-scrollbar-track": { background: "transparent" },
						"& ::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.1)", borderRadius: "10px" },
						"& ::-webkit-scrollbar-thumb:hover": { background: "rgba(255,255,255,0.2)" },
					},
				}}
			>
				{/* Brand */}
				<Box
					onMouseDown={handleMouseDown}
					sx={{
						position: "absolute",
						top: 0,
						right: -3,
						bottom: 0,
						width: 6,
						cursor: "col-resize",
						zIndex: 9999,
						"&:hover, &:active": {
							bgcolor: "primary.main",
							opacity: 0.5,
						},
					}}
				/>

				{/* Brand */}
				<Box sx={{ px: 3, py: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
					<Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
						<HotelIcon sx={{ fontSize: 18, color: "primary.contrastText" }} />
					</Box>
					<Box sx={{ overflow: "hidden" }}>
						<Typography variant="subtitle2" fontWeight={700} lineHeight={1.2} noWrap>
							Vinabooking
						</Typography>
						<Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
							Owner Portal
						</Typography>
					</Box>
				</Box>

				<Divider />

				{/* Owner identity card */}
				<Box sx={{ mx: 2, my: 2, p: 1.5, borderRadius: 2, bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 1.5 }}>
					<Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", color: "primary.contrastText", fontSize: 14, fontWeight: 700 }}>{avatarLetter}</Avatar>
					<Box sx={{ minWidth: 0 }}>
						<Tooltip title={user?.email} placement="right" arrow>
							<Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: drawerWidth - 100 }}>
								{user?.email}
							</Typography>
						</Tooltip>
						<Chip
							icon={<AdminPanelSettingsIcon sx={{ fontSize: "12px !important" }} />}
							label="Owner"
							size="small"
							color="primary"
							variant="outlined"
							sx={{ height: 18, fontSize: 10, mt: 0.25, "& .MuiChip-label": { px: 0.75 } }}
						/>
					</Box>
				</Box>

				{/* Navigation */}
				<Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
					<Typography variant="overline" color="text.disabled" sx={{ fontSize: 10, letterSpacing: 1.2, fontWeight: 700 }}>
						Navigation
					</Typography>
				</Box>
				<List sx={{ px: 1.5, pt: 0.5 }}>
					{navItems.map(({ label, icon, path }) => {
						const isBookingItem = path === "/owner/manage-booking";
						const isActive = isBookingItem ? location.pathname === path : location.pathname === path;
						return (
							<Box key={path}>
								<ListItem disablePadding sx={{ mb: 0.5 }}>
									<ListItemButton
										onClick={() => navigate(isBookingItem ? `${path}?status=BOOKED` : path)}
										selected={isActive}
										sx={{
											borderRadius: 2,
											py: 1,
											"&.Mui-selected": {
												bgcolor: "primary.main",
												color: "primary.contrastText",
												"& .MuiListItemIcon-root": {
													color: "primary.contrastText",
												},
												"&:hover": {
													bgcolor: "primary.dark",
												},
											},
											"&:hover:not(.Mui-selected)": {
												bgcolor: "action.hover",
											},
										}}
									>
										<ListItemIcon
											sx={{
												minWidth: 36,
												color: isActive ? "inherit" : "text.secondary",
											}}
										>
											{icon}
										</ListItemIcon>
										<ListItemText
											primary={label}
											primaryTypographyProps={{
												fontSize: 14,
												fontWeight: isActive ? 600 : 400,
											}}
										/>
										{isActive && (
											<Box
												sx={{
													width: 6,
													height: 6,
													borderRadius: "50%",
													bgcolor: "primary.contrastText",
													opacity: 0.7,
													flexShrink: 0,
												}}
											/>
										)}
									</ListItemButton>
								</ListItem>
								{isBookingItem && (
									<List dense disablePadding sx={{ mb: 0.75, pl: 5 }}>
										{bookingStatusItems.map((item) => {
											const isStatusActive = location.pathname === path && activeBookingStatus === item.status;
											return (
												<ListItem key={item.status} disablePadding sx={{ mb: 0.25 }}>
													<ListItemButton
														onClick={() => navigate(`${path}?status=${item.status}`)}
														selected={isStatusActive}
														sx={{
															borderRadius: 1.5,
															py: 0.65,
															px: 1.25,
															"&.Mui-selected": {
																bgcolor: "primary.main",
																color: "primary.contrastText",
																"&:hover": {
																	bgcolor: "primary.dark",
																},
															},
															"&:hover:not(.Mui-selected)": {
																bgcolor: "action.hover",
															},
														}}
													>
														<ListItemText
															primary={item.label}
															primaryTypographyProps={{
																fontSize: 13,
																fontWeight: isStatusActive ? 700 : 500,
															}}
														/>
													</ListItemButton>
												</ListItem>
											);
										})}
									</List>
								)}
							</Box>
						);
					})}
				</List>

				<Box sx={{ flexGrow: 1 }} />

				{/* Logout */}
				<Box sx={{ p: 2, mt: "auto" }}>
					<Button
						fullWidth
						variant="text"
						color="error"
						size="small"
						startIcon={<LogoutIcon fontSize="small" />}
						onClick={handleLogout}
						sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, justifyContent: "flex-start", px: 2, "&:hover": { bgcolor: "error.dark", color: "#fff" } }}
					>
						Logout
					</Button>
				</Box>
			</Drawer>

			{/* Main content */}
			<Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default", p: 4, minHeight: "100vh", overflowX: "hidden" }}>
				{children}
			</Box>
		</Box>
	);
};
