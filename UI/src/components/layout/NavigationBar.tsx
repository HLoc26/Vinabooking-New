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
import { Link as RouterLink } from "react-router-dom";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { accommodationTypes } from "../../constants/accommodation.tsx";

import LoginModal from "../shared/LoginModal.tsx";
import { usePushNotificationContext } from "../../context/PushNotification/hook.tsx";
import { Avatar, ListItemIcon, ListItemText, Stack } from "@mui/material";
import { ExitToAppOutlined, LuggageOutlined, PersonOutlineOutlined, StarOutlineRounded } from "@mui/icons-material";
import useModalContext from "../../context/ModalContext/hook.ts";

import { useLogoutMutation } from "../../features/auth/hooks/useLogout";
import useUserProfileInfo from "../../hooks/useUserProfileInfo";

const pages = [
	{ label: "Search", path: "/search" },
	{ label: "Destinations", path: "/destinations" },
	{ label: "About Us", path: "/about" },
];
const NavigationBar: React.FC = () => {
	const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
	const [anchorElAccommodation, setAnchorElAccommodation] = useState<null | HTMLElement>(null);
	const [anchorElProfile, setAnchorElProfile] = useState<null | HTMLElement>(null);

	const { openModal, closeModal } = useModalContext();

	const { pushNotification } = usePushNotificationContext();

	const { userInfo: user, userAvatars } = useUserProfileInfo();
	const thumbnail = userAvatars.find((a) => a.variant === "THUMBNAIL");

	const logoutMutation = useLogoutMutation();

	const handleLogout = () => {
		logoutMutation.mutate(undefined, {
			onSuccess: () => {
				pushNotification("Logged out successfully!", "success");
				setAnchorElProfile(null);
			},
			onError: (error) => {
				pushNotification(error.message || "Failed to logout", "error");
			},
		});
	};

	return (
		<>
			<AppBar position="sticky" color="inherit" elevation={1}>
				<Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
					{/* Left */}
					<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
						<Typography //
							variant="h6"
							component={RouterLink}
							to="/"
							sx={{ textDecoration: "none", color: "inherit", fontWeight: 600 }}
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

							<Menu
								anchorEl={anchorElAccommodation}
								open={Boolean(anchorElAccommodation)}
								onClose={() => setAnchorElAccommodation(null)}
								slotProps={{ paper: { sx: { p: 2, minWidth: 400 } } }}
							>
								<Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
									{accommodationTypes.map((item) => (
										<MenuItem //
											key={item.type}
											component={RouterLink}
											to={`/${item.type}`}
											onClick={() => setAnchorElAccommodation(null)}
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

							<Menu anchorEl={anchorElNav} open={Boolean(anchorElNav)} onClose={() => setAnchorElNav(null)}>
								{pages.map((p) => (
									<MenuItem key={p.path} component={RouterLink} to={p.path} onClick={() => setAnchorElNav(null)}>
										{p.label}
									</MenuItem>
								))}
								<MenuItem disabled>Accommodation Types</MenuItem>

								{accommodationTypes.map((item) => (
									<MenuItem //
										key={item.type}
										component={RouterLink}
										to={`/accommodation/${item.type}`}
										onClick={() => setAnchorElNav(null)}
										sx={{ pl: 4 }}
									>
										{item.label}
									</MenuItem>
								))}
							</Menu>
						</Box>
					</Box>

					{/* Right side */}
					<Box mr={7}>
						{user ? (
							<>
								<Button endIcon={<ArrowDropDownIcon />} onClick={(e) => setAnchorElProfile(e.currentTarget)} sx={{ color: "text.primary" }}>
									<Stack direction={"row"} alignItems={"center"} gap={2}>
										<Avatar alt={user.name} src={thumbnail?.url} />
										<Typography variant="subtitle2">{user.name || "Profile"}</Typography>
									</Stack>
								</Button>

								<Menu
									anchorOrigin={{
										vertical: "bottom",
										horizontal: "right",
									}}
									transformOrigin={{
										vertical: "top",
										horizontal: "right",
									}}
									anchorEl={anchorElProfile}
									open={Boolean(anchorElProfile)}
									onClose={() => setAnchorElProfile(null)}
								>
									<MenuItem component={RouterLink} to="/user/me/profile" onClick={() => setAnchorElProfile(null)}>
										<ListItemIcon>
											<PersonOutlineOutlined />
										</ListItemIcon>
										<ListItemText>My Profile</ListItemText>
									</MenuItem>
									<MenuItem component={RouterLink} to="/user/me/my-bookings" onClick={() => setAnchorElProfile(null)}>
										<ListItemIcon>
											<LuggageOutlined />
										</ListItemIcon>
										<ListItemText>My Bookings</ListItemText>
									</MenuItem>
									<MenuItem component={RouterLink} to="/user/me/favorites" onClick={() => setAnchorElProfile(null)}>
										<ListItemIcon>
											<StarOutlineRounded />
										</ListItemIcon>
										<ListItemText>Favorites</ListItemText>
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
					</Box>
				</Toolbar>
			</AppBar>
		</>
	);
};

export default NavigationBar;
