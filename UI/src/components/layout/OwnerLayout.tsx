import { useEffect, useState, useRef, useCallback, type ReactNode } from "react";
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

const MIN_DRAWER_WIDTH = 260;
const MAX_DRAWER_WIDTH = 500;

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
	const widthRef = useRef(drawerWidth);

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		isResizing.current = true;
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";

		const handleMouseMove = (moveEvent: MouseEvent) => {
			if (!isResizing.current) return;
			let newWidth = moveEvent.clientX;
			if (newWidth < MIN_DRAWER_WIDTH) newWidth = MIN_DRAWER_WIDTH;
			if (newWidth > MAX_DRAWER_WIDTH) newWidth = MAX_DRAWER_WIDTH;

			widthRef.current = newWidth;
			setDrawerWidth(newWidth);
		};

		const handleMouseUp = () => {
			isResizing.current = false;
			document.body.style.cursor = "default";
			document.body.style.userSelect = "auto";
			localStorage.setItem("vinabooking_sidebar_width", widthRef.current.toString()); // Lưu trạng thái
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
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
						transition: isResizing.current ? "none" : "width 0.2s ease", // Tắt animation khi đang kéo để mượt hơn
						overflow: "visible", // Để thanh kéo thò ra ngoài một xíu dễ nắm
						"& ::-webkit-scrollbar": { width: "4px" },
						"& ::-webkit-scrollbar-track": { background: "transparent" },
						"& ::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.1)", borderRadius: "10px" },
						"& ::-webkit-scrollbar-thumb:hover": { background: "rgba(255,255,255,0.2)" },
					},
				}}
				variant="permanent"
				anchor="left"
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
				<NavigationMenu />

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
