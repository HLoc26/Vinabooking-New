import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import LoginForm from "../components/LoginForm";

const LoginPage: React.FC = () => {
	const navigate = useNavigate();

	const location = useLocation();

	const isOwnerPage = location.pathname.startsWith("/owner");
	const handleSuccessLogin = () => {
		if (isOwnerPage) {
			navigate("/owner/dashboard");
		} else {
			navigate("/");
		}
	};

	return (
		<Box //
			display="flex"
			justifyContent="center"
			alignItems="center"
			minHeight="100vh"
			bgcolor="background.default"
		>
			<Card sx={{ width: 400, p: 2, boxShadow: 3 }}>
				<CardContent>
					<Typography //
						variant="h5"
						fontWeight="bold"
						textAlign="center"
						color="text.primary"
					>
						Log In
					</Typography>
					<Box mt={3}>
						<LoginForm onSuccess={handleSuccessLogin} />
					</Box>
				</CardContent>
			</Card>
		</Box>
	);
};

export default LoginPage;
