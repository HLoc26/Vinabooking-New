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

import LoginModal from "../../features/auth/components/LoginModal.tsx";
import { usePushNotificationContext } from "../../context/PushNotification/hook.tsx";
import useAuthContextProvider from "../../context/AuthContext/hook.tsx";
import useUserContextProvider from "../../context/UserContext/hook.ts";
import { Avatar, ListItemIcon, ListItemText, Stack } from "@mui/material";
import { ExitToAppOutlined, LuggageOutlined, PersonOutlineOutlined, StarOutlineRounded } from "@mui/icons-material";
import useModalContext from "../../context/ModalContext/hook.ts";

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

	const navigate = useNavigate();
	const { logout } = useAuthContextProvider();
	const { userInfo: user, userAvatars } = useUserContextProvider();
	const thumbnail = userAvatars.find((a) => a.variant === "THUMBNAIL");

	const handleLogout = async () => {
		try {
			const success = await logout();
			if (!success) {
				throw new Error("Failed to logout");
			}
			pushNotification("Logged out successfully!", "success");
			navigate("/");
		} catch (error) {
			const err = error as Error;
			pushNotification(err.message, "error");
		}
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
									<MenuItem component={RouterLink} to="/user/me" onClick={() => setAnchorElProfile(null)}>
										<ListItemIcon>
											<PersonOutlineOutlined />
										</ListItemIcon>
										<ListItemText>My Profile</ListItemText>
									</MenuItem>
									<MenuItem component={RouterLink} to="/favorites" onClick={() => setAnchorElProfile(null)}>
										<ListItemIcon>
											<StarOutlineRounded />
										</ListItemIcon>
										<ListItemText>Favorites</ListItemText>
									</MenuItem>
									<MenuItem component={RouterLink} to="/my-bookings" onClick={() => setAnchorElProfile(null)}>
										<ListItemIcon>
											<LuggageOutlined />
										</ListItemIcon>
										<ListItemText>My Bookings</ListItemText>
									</MenuItem>
									<MenuItem onClick={handleLogout}>
										{" "}
										<ListItemIcon>
											<ExitToAppOutlined />
										</ListItemIcon>
										<ListItemText>Logout</ListItemText>
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
