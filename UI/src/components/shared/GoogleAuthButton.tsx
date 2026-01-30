import React from "react";
import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_URL = import.meta.env.VITE_API_URL;

export const GoogleAuthButton: React.FC = () => {
	const handleLogin = () => {
		const redirectUri = `${API_URL}/auth/google/callback`;

		const scope = ["openid", "email", "profile"].join(" ");

		const params = new URLSearchParams({
			client_id: GOOGLE_CLIENT_ID!,
			redirect_uri: redirectUri,
			response_type: "code",
			scope,
			access_type: "offline",
			prompt: "consent",
		});

		const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
		window.location.href = googleAuthUrl;
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
			}}
		>
			Continue with Google
		</Button>
	);
};
