import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import RegisterForm from "../components/RegisterForm";

const RegisterPage: React.FC = () => {
	return (
		<Box //
			display="flex"
			justifyContent="center"
			alignItems="center"
			minHeight="100vh"
			bgcolor="background.default"
		>
			<Card sx={{ width: 450, p: 3, boxShadow: 3 }}>
				<CardContent>
					<Typography //
						variant="h5"
						fontWeight="bold"
						textAlign="center"
						color="text.primary"
					>
						Register
					</Typography>
					<Box mt={3}>
						<RegisterForm />
					</Box>
				</CardContent>
			</Card>
		</Box>
	);
};

export default RegisterPage;
