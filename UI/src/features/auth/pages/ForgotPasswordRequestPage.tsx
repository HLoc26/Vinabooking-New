import React from "react";
import { Box, Paper } from "@mui/material";
import ForgotPasswordRequestForm from "../components/ForgotPasswordRequestForm";

const ForgotPasswordRequestPage: React.FC = () => {
	return (
		<Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" sx={{ bgcolor: "background.default", px: 2 }}>
			<Paper
				elevation={3}
				sx={{
					width: "100%",
					maxWidth: 400,
					p: 4,
					borderRadius: 3,
					bgcolor: "background.paper",
				}}
			>
				<ForgotPasswordRequestForm />
			</Paper>
		</Box>
	);
};

export default ForgotPasswordRequestPage;
