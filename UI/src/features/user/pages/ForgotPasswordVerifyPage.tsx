import React from "react";
import { Box, Paper } from "@mui/material";
import ForgotPasswordVerifyForm from "../components/ForgotPasswordVerifyForm";

const ForgotPasswordVerifyPage: React.FC = () => {
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
				<ForgotPasswordVerifyForm />
			</Paper>
		</Box>
	);
};

export default ForgotPasswordVerifyPage;
