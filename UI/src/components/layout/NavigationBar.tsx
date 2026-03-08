import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import Button from "@mui/material/Button";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { accommodationTypes } from "../../constants/accommodation.tsx";

import LoginModal from "../shared/LoginModal.tsx";
import { usePushNotificationContext } from "../../context/PushNotification/hook.tsx";
import { Avatar, ListItemIcon, ListItemText, Stack, ListSubheader } from "@mui/material";
import { AddHomeWorkRounded, ExitToAppOutlined, LuggageOutlined, PersonOutlineOutlined, StarOutlineRounded } from "@mui/icons-material";
import useModalContext from "../../context/ModalContext/hook.ts";

import { useLogoutMutation } from "../../features/auth/hooks/useLogout";
import { useUserProfile } from "../../features/user/hooks/useUserProfile.ts";
import { useUserAvatars } from "../../features/user/hooks/useUserAvatars.ts";

const pages = [
	{ label: "Search", path: "/search" },
	{ label: "Destinations", path: "/destinations" },
	{ label: "About Us", path: "/about" },
];

const NavigationBar: React.FC = () => {
	const navigate = useNavigate();
	const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
	const [anchorElAccommodation, setAnchorElAccommodation] = useState<null | HTMLElement>(null);
	const [anchorElProfile, setAnchorElProfile] = useState<null | HTMLElement>(null);

	const { openModal, closeModal } = useModalContext();
	const { pushNotification } = usePushNotificationContext();
	const { currentAvatarUrl } = useUserAvatars();
	const { userInfo } = useUserProfile();
	const logoutMutation = useLogoutMutation();

	const handleCloseNavMenu = () => setAnchorElNav(null);
	const handleCloseAccommodationMenu = () => setAnchorElAccommodation(null);
	const handleCloseProfileMenu = () => setAnchorElProfile(null);

	const handleLogout = () => {
		logoutMutation.mutate(undefined, {
			onSuccess: () => {
				pushNotification("Logged out successfully!", "success");
				handleCloseProfileMenu();
			},
			onError: (error) => {
				pushNotification(error.message || "Failed to logout", "error");
			},
		});
	};

	const isOwner = userInfo?.role === "ACCOMMODATION_OWNER";

	return (
		<AppBar position="sticky" color="inherit" elevation={1} sx={{ px: 20 }}>
			<Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
				{/* ================= LEFT SIDE ================= */}
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<Typography
						variant="h6"
						component={RouterLink}
						to="/"
						sx={{
							textDecoration: "none",
							color: "inherit",
							fontWeight: 600,
						}}
					>
						VinaBooking
					</Typography>

					{/* Desktop Menu */}
					<Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
						{/* pages */}
						{pages.map((p) => (
							<Button //
								key={p.path}
								component={RouterLink}
								to={p.path}
								sx={{ color: "text.primary" }}
							>
								{p.label}
							</Button>
						))}

						{/* accommodation dropdown */}
						<Button //
							startIcon={<ArrowDropDownIcon />}
							onClick={(e) => setAnchorElAccommodation(e.currentTarget)}
							sx={{ color: "text.primary" }}
						>
							Accommodation Types
						</Button>

						<Menu //
							anchorEl={anchorElAccommodation}
							open={Boolean(anchorElAccommodation)}
							onClose={handleCloseAccommodationMenu}
							slotProps={{ paper: { sx: { p: 2, minWidth: 400 } } }}
						>
							<Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
								{accommodationTypes.map((item) => (
									<MenuItem //
										key={item.type}
										component={RouterLink}
										to={`/${item.type}`}
										onClick={handleCloseAccommodationMenu}
										sx={{ gap: 1 }}
									>
										{item.icon}
										{item.label}
									</MenuItem>
								))}
							</Box>
						</Menu>
					</Box>

					{/* Mobile menu */}
					<Box sx={{ display: { xs: "flex", md: "none" } }}>
						<IconButton onClick={(e) => setAnchorElNav(e.currentTarget)}>
							<MenuIcon />
						</IconButton>

						<Menu anchorEl={anchorElNav} open={Boolean(anchorElNav)} onClose={handleCloseNavMenu}>
							{pages.map((p) => (
								<MenuItem key={p.path} component={RouterLink} to={p.path} onClick={handleCloseNavMenu}>
									{p.label}
								</MenuItem>
							))}
							<ListSubheader sx={{ lineHeight: "36px", bgcolor: "transparent" }}>Accommodation Types</ListSubheader>

							{accommodationTypes.map((item) => (
								<MenuItem //
									key={item.type}
									component={RouterLink}
									to={`/accommodation/${item.type}`}
									onClick={handleCloseNavMenu}
									sx={{ pl: 4 }}
								>
									{item.label}
								</MenuItem>
							))}
						</Menu>
					</Box>
				</Box>

				{/* ================= RIGHT SIDE ================= */}
				<Stack direction="row" alignItems="center" spacing={2} pr={{ xs: 0, md: 2 }}>
					{/* Become a Host / Host Dashboard */}
					<Button
						variant="text"
						onClick={() => navigate(isOwner ? "/owner/home" : "/owner/landing")}
						sx={{
							display: { xs: "none", sm: "block" }, // Does not shown on small screens
							color: "text.primary",
							fontWeight: 600,
						}}
					>
						{isOwner ? "Host Dashboard" : "Become a host"}
					</Button>

					{userInfo ? (
						<>
							<Button onClick={(e) => setAnchorElProfile(e.currentTarget)} sx={{ color: "text.primary" }}>
								<Stack direction={"row"} alignItems={"center"} gap={2}>
									<Avatar alt={userInfo.name} src={currentAvatarUrl} sx={{ width: 32, height: 32 }} />
									<Typography variant="subtitle2" sx={{ textTransform: "none", display: { xs: "none", sm: "block" } }}>
										{userInfo.name || "Profile"}
									</Typography>
									<ArrowDropDownIcon />
								</Stack>
							</Button>

							<Menu
								anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
								transformOrigin={{ vertical: "top", horizontal: "right" }}
								anchorEl={anchorElProfile}
								open={Boolean(anchorElProfile)}
								onClose={handleCloseProfileMenu}
							>
								<MenuItem component={RouterLink} to="/user/me/profile" onClick={handleCloseProfileMenu}>
									<ListItemIcon>
										<PersonOutlineOutlined />
									</ListItemIcon>
									<ListItemText>My Profile</ListItemText>
								</MenuItem>
								<MenuItem component={RouterLink} to="/user/me/my-bookings" onClick={handleCloseProfileMenu}>
									<ListItemIcon>
										<LuggageOutlined />
									</ListItemIcon>
									<ListItemText>My Bookings</ListItemText>
								</MenuItem>
								<MenuItem component={RouterLink} to="/user/me/favorites" onClick={handleCloseProfileMenu}>
									<ListItemIcon>
										<StarOutlineRounded />
									</ListItemIcon>
									<ListItemText>Favorites</ListItemText>
								</MenuItem>

								<MenuItem
									sx={{ display: { xs: "flex", sm: "none" } }}
									onClick={() => {
										handleCloseProfileMenu();
										navigate(isOwner ? "/owner/home" : "/owner/landing");
									}}
								>
									<ListItemIcon>
										<AddHomeWorkRounded />
									</ListItemIcon>
									<ListItemText>{isOwner ? "Host Dashboard" : "Become a host"}</ListItemText>
								</MenuItem>

								<MenuItem onClick={handleLogout}>
									<ListItemIcon>
										<ExitToAppOutlined />
									</ListItemIcon>
									<ListItemText>{logoutMutation.isPending ? "Logging out..." : "Logout"}</ListItemText>
								</MenuItem>
							</Menu>
						</>
					) : (
						<Button variant="outlined" onClick={() => openModal(<LoginModal onLoginSuccess={() => closeModal()} />)}>
							Login
						</Button>
					)}
				</Stack>
			</Toolbar>
		</AppBar>
	);
};

export default NavigationBar;
