import React, { useState } from "react";
import { Box, Button, TextField, Typography, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForgotPassword } from "../hooks/useForgotPassword";

const ForgotPasswordRequestPage: React.FC = () => {
	const [email, setEmail] = useState("");
	const { requestOTP, loading } = useForgotPassword();
	const navigate = useNavigate();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		requestOTP(email);
	};

	return (
		<Box component="form" onSubmit={handleSubmit}>
			<Typography variant="h5" mb={2} textAlign="center">
				Forgot Password
			</Typography>
			<TextField fullWidth margin="normal" label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
			<Button fullWidth variant="contained" color="secondary" type="submit" sx={{ mt: 2, py: 1.2 }} disabled={loading}>
				{loading ? "Processing..." : "Send OTP"}
			</Button>

			<Typography variant="body2" textAlign="center" mt={2}>
				Remembered your password?{" "}
				<Link component="button" onClick={() => navigate("/auth/login")} color="primary">
					Login
				</Link>
			</Typography>
		</Box>
	);
};

export default ForgotPasswordRequestPage;
