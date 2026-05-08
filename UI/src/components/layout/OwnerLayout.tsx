import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { setOwnerProfile } from "../../features/auth/authSlice";
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

const drawerWidth = 280;

export const OwnerLayout: React.FC<OwnerLayoutProps> = ({ children }) => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const user = useSelector((root: RootState) => root.auth.user);
	const { pushNotification } = usePushNotificationContext();
	const { data: ownerInfo, isLoading, isError, error } = useOwnerInfo();

	const isNotOwner = user?.role !== "ACCOMMODATION_OWNER";

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
		console.log("Logout clicked");
	};

	const avatarLetter = user?.email?.[0]?.toUpperCase() ?? "O";

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
				<NavigationMenu />

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
