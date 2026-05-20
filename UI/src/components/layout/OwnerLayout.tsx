import { useEffect, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { setOwnerProfile } from "../../features/auth/authSlice";
import { useOwnerInfo } from "../../features/owner/hooks/useOwnerInfo";
import { CircularProgress, Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Divider, Button, ListItemButton, Avatar, Tooltip, Chip } from "@mui/material";
import type { AxiosError } from "axios";
import { usePushNotificationContext } from "../../context/PushNotification/hook";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BookingIcon from "@mui/icons-material/BookOnline";
import PriceIcon from "@mui/icons-material/PriceChange";
import LogoutIcon from "@mui/icons-material/Logout";
import HotelIcon from "@mui/icons-material/Hotel";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

interface OwnerLayoutProps {
	children: ReactNode;
}

const drawerWidth = 260;

const navItems = [
	{ label: "Dashboard", icon: <DashboardIcon fontSize="small" />, path: "/owner/dashboard" },
	{ label: "Manage Booking", icon: <BookingIcon fontSize="small" />, path: "/owner/manage-booking" },
	{ label: "Manage Price", icon: <PriceIcon fontSize="small" />, path: "/owner/manage-price" },
];

const bookingStatusItems = [
	{ label: "Incoming", status: "BOOKED" },
	{ label: "Cancelled", status: "CANCELLED" },
	{ label: "Completed", status: "COMPLETED" },
];

export const OwnerLayout: React.FC<OwnerLayoutProps> = ({ children }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const user = useSelector((root: RootState) => root.auth.user);
	const { pushNotification } = usePushNotificationContext();
	const { data: ownerInfo, isLoading, isError, error } = useOwnerInfo();

	const isNotOwner = !user || user.role !== "ACCOMMODATION_OWNER";

	useEffect(() => {
		if (isNotOwner) {
			navigate("/owner/landing", { replace: true });
			return;
		}
		if (isLoading) return;
		if (isError && (error as AxiosError)?.response?.status === 404) {
			pushNotification("Please complete your profile to continue.", "info");
			navigate("/owner/onboard", { replace: true });
			return;
		}
		if (isError && (error as AxiosError)?.response?.status === 403) {
			pushNotification("Access denied. Please check your permissions.", "error");
			navigate("/owner/landing", { replace: true });
			return;
		}
		if (ownerInfo) {
			dispatch(setOwnerProfile(ownerInfo));
		}
	}, [isNotOwner, ownerInfo, isLoading, isError, error, navigate, dispatch, pushNotification]);

	if (isNotOwner) return null;

	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
				<CircularProgress />
			</Box>
		);
	}

	if (!ownerInfo) return null;

	const handleLogout = () => {
		console.log("Logout clicked");
	};

	const avatarLetter = user?.email?.[0]?.toUpperCase() ?? "O";
	const activeBookingStatus = new URLSearchParams(location.search).get("status") ?? "BOOKED";

	return (
		<Box sx={{ display: "flex" }}>
			<Drawer
				sx={{
					width: drawerWidth,
					flexShrink: 0,
					"& .MuiDrawer-paper": {
						width: drawerWidth,
						boxSizing: "border-box",
						display: "flex",
						flexDirection: "column",
						borderRight: "1px solid",
						borderColor: "divider",
					},
				}}
				variant="permanent"
				anchor="left"
			>
				{/* Brand */}
				<Box
					sx={{
						px: 3,
						py: 2.5,
						display: "flex",
						alignItems: "center",
						gap: 1.5,
					}}
				>
					<Box
						sx={{
							width: 36,
							height: 36,
							borderRadius: 2,
							bgcolor: "primary.main",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexShrink: 0,
						}}
					>
						<HotelIcon sx={{ fontSize: 20, color: "primary.contrastText" }} />
					</Box>
					<Box>
						<Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
							Vinabooking
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Owner Portal
						</Typography>
					</Box>
				</Box>

				<Divider />

				{/* Owner identity card */}
				<Box
					sx={{
						mx: 2,
						my: 2,
						p: 1.5,
						borderRadius: 2,
						bgcolor: "action.hover",
						display: "flex",
						alignItems: "center",
						gap: 1.5,
					}}
				>
					<Avatar
						sx={{
							width: 38,
							height: 38,
							bgcolor: "primary.main",
							color: "primary.contrastText",
							fontSize: 15,
							fontWeight: 700,
						}}
					>
						{avatarLetter}
					</Avatar>
					<Box sx={{ minWidth: 0 }}>
						<Tooltip title={user?.email} placement="right">
							<Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 150 }}>
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

				<Divider />

				{/* Navigation */}
				<Box sx={{ px: 1.5, pt: 1.5 }}>
					<Typography variant="overline" color="text.disabled" sx={{ px: 1, fontSize: 10, letterSpacing: 1.2 }}>
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
				<Divider />
				<Box sx={{ p: 2 }}>
					<Button
						fullWidth
						variant="outlined"
						color="error"
						size="small"
						startIcon={<LogoutIcon fontSize="small" />}
						onClick={handleLogout}
						sx={{
							borderRadius: 2,
							textTransform: "none",
							fontWeight: 500,
							justifyContent: "flex-start",
							px: 2,
						}}
					>
						Logout
					</Button>
				</Box>
			</Drawer>

			{/* Main content */}
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					bgcolor: "background.default",
					p: 4,
					minHeight: "100vh",
				}}
			>
				{children}
			</Box>
		</Box>
	);
};
