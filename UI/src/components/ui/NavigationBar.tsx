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
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { accommodationTypes } from "../../constants/accommodation.tsx";
import useAuth from "../../features/user/hooks/useAuth.ts";

import LoginModal from "./LoginModal.tsx";
import { usePushNotificationContext } from "../../context/PushNotification/hook.tsx";

const pages = [
	{ label: "Search", path: "/search" },
	{ label: "Destinations", path: "/destinations" },
	{ label: "About Us", path: "/about" },
];
const NavigationBar: React.FC = () => {
	const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
	const [anchorElAccommodation, setAnchorElAccommodation] = useState<null | HTMLElement>(null);
	const [anchorElProfile, setAnchorElProfile] = useState<null | HTMLElement>(null);
	const [openLoginModal, setOpenLoginModal] = useState(false);
	const { pushNotification } = usePushNotificationContext ();

	const navigate = useNavigate();
	const { logout, getCurrentUser } = useAuth();
	const user = getCurrentUser();

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
			<AppBar position="static" color="inherit" elevation={1}>
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
					<Box>
						{user ? (
							<>
								<Button startIcon={<AccountCircleIcon />} endIcon={<ArrowDropDownIcon />} onClick={(e) => setAnchorElProfile(e.currentTarget)} sx={{ color: "text.primary" }}>
									{user.name || "Profile"}
								</Button>

								<Menu anchorEl={anchorElProfile} open={Boolean(anchorElProfile)} onClose={() => setAnchorElProfile(null)}>
									<MenuItem component={RouterLink} to="/profile" onClick={() => setAnchorElProfile(null)}>
										My Profile
									</MenuItem>
									<MenuItem component={RouterLink} to="/favorites" onClick={() => setAnchorElProfile(null)}>
										Favorites
									</MenuItem>
									<MenuItem component={RouterLink} to="/my-bookings" onClick={() => setAnchorElProfile(null)}>
										My Bookings
									</MenuItem>
									<MenuItem onClick={handleLogout}>Logout</MenuItem>
								</Menu>
							</>
						) : (
							<Button variant="outlined" onClick={() => setOpenLoginModal(true)}>
								Login
							</Button>
						)}
					</Box>
				</Toolbar>
			</AppBar>

			{/* Login Modal */}
			<LoginModal open={openLoginModal} onClose={() => setOpenLoginModal(false)} />
		</>
	);
};

export default NavigationBar;
