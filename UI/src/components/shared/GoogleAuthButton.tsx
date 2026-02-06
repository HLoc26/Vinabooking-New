import React from "react";
import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { getGoogleAuthUrl } from "../../features/auth/authApi";

export const GoogleAuthButton: React.FC = () => {
	const handleLogin = () => {
		const googleAuthUrl = getGoogleAuthUrl();
		globalThis.location.href = googleAuthUrl;
	};

	return (
		<Button
			variant="outlined"
			color="primary"
			startIcon={<GoogleIcon />}
			onClick={handleLogin}
			sx={{
				textTransform: "none",
				borderRadius: "10px",
				backgroundColor: "#fff",
				"&:hover": { backgroundColor: "#f5f5f5" },
				width: "100%",
			}}
		>
			Continue with Google
		</Button>
	);
};
