import { Box, Button, Typography, AppBar, Container, Paper, Grid } from "@mui/material";
import { Palette } from "@mui/icons-material";

import { useAuth } from "../../user/hooks/useAuth"; // đường dẫn tuỳ project
import { usePushNotificationContext } from "../../../context/PushNotification/hook";
import { useNavigate } from "react-router-dom";
import { GoogleAuthButton } from "../../user/components/GoogleAuthButton";

export const HomePage = () => {
	const navigate = useNavigate();
	const { logout, getCurrentUser } = useAuth();
	const { pushNotification } = usePushNotificationContext();

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
		<Box sx={{ flexGrow: 1 }}>
			<AppBar position="static" color="primary" elevation={1}></AppBar>
			<Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
				<Paper elevation={4} sx={{ p: 4, borderRadius: 4, backgroundColor: "background.paper" }}>
					<Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: "primary.main" }}>
						🚀 Welcome {user?.name ?? "Guest"}
					</Typography>
					<Typography variant="h5" sx={{ mt: 5, mb: 2, fontWeight: 500 }}>
						<Palette sx={{ mb: -0.5, mr: 1, color: "secondary.main" }} />
						Theme Palette
					</Typography>
					<Grid container spacing={2}>
						<Grid size={{ xs: 6, sm: 3 }}>
							<Button fullWidth variant="contained" color="primary">
								Primary
							</Button>
						</Grid>
						<Grid size={{ xs: 6, sm: 3 }}>
							<Button fullWidth variant="contained" color="secondary">
								Secondary
							</Button>
						</Grid>
						<Grid size={{ xs: 6, sm: 3 }}>
							<Button fullWidth variant="contained" color="warning">
								Accent
							</Button>
						</Grid>
						<Grid size={{ xs: 6, sm: 3 }}>
							<Button fullWidth variant="outlined" color="primary">
								Text Color
							</Button>
						</Grid>
						<Grid size={{ xs: 6, sm: 3 }}>
							<Button
								fullWidth
								variant="contained"
								color="success"
								onClick={() => {
									navigate("/login");
								}}
							>
								Log In
							</Button>
						</Grid>
						<Grid size={{ xs: 6, sm: 3 }}>
							<Button
								fullWidth
								variant="contained"
								color="info"
								onClick={() => {
									navigate("/register");
								}}
							>
								Register
							</Button>
						</Grid>
						<Grid size={{ xs: 6, sm: 3 }}>
							<Button fullWidth variant="contained" color="error" onClick={handleLogout}>
								Sign Out
							</Button>
						</Grid>
						<Grid size={{ xs: 6, sm: 3 }}>
							<GoogleAuthButton />
						</Grid>
					</Grid>
				</Paper>
			</Container>
		</Box>
	);
};
