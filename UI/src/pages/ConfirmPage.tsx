import React, { useState } from "react";
import { Box, Button, Typography, Link } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import type { OtpLocationState } from "../features/auth/types/LocationState";
import useRegister from "../features/auth/hooks/useRegister";
import OtpInput from "../components/shared/OtpInput";
import { usePushNotificationContext } from "../context/PushNotification/hook";

const ConfirmOTPPage: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { pushNotification } = usePushNotificationContext();
	const state = location.state as OtpLocationState | undefined;

	const [otp, setOtp] = useState("");
	const { resendOtp, confirmOtp, loading } = useRegister();

	React.useEffect(() => {
		if (!state || !state.destination) {
			navigate("/auth/register");
		}
	}, [state, navigate]);

	if (!state || !state.destination) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
				<Typography variant="body1">Redirecting...</Typography>
			</Box>
		);
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!otp.trim() || otp.trim().length < 6) {
			pushNotification("Please enter your OTP code.", "warning");
			return;
		}

		try {
			const success = await confirmOtp(state.email, otp);
			if (success) {
				pushNotification("Success! Please wait for the redirect.");
				navigate("/auth/login");
			}
		} catch (e) {
			const error = e as Error;
			pushNotification(error.message, "error");
			console.error(error.message);
		}
	};

	const handleResend = async () => {
		try {
			await resendOtp(state.email);
		} catch (e) {
			const error = e as Error;
			pushNotification(error.message, "error");
			console.error(error.message);
		}
	};

	return (
		<Box //
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			minHeight="100vh"
			sx={{ bgcolor: "background.default", px: 2 }}
		>
			<Box
				component="form"
				onSubmit={handleSubmit}
				sx={{
					width: "100%",
					maxWidth: 400,
					p: 4,
					borderRadius: 3,
					boxShadow: 3,
					bgcolor: "background.paper",
				}}
			>
				<Typography variant="h5" textAlign="center" mb={2}>
					Confirm OTP
				</Typography>

				<Typography variant="body2" textAlign="center" color="text.secondary" mb={2}>
					An OTP has been sent to <strong>{state.destination}</strong>.
				</Typography>

				<OtpInput length={6} onChange={setOtp} />

				<Button //
					fullWidth
					variant="contained"
					color="primary"
					type="submit"
					sx={{ mt: 2, py: 1.2 }}
					disabled={loading}
				>
					{loading ? "Verifying..." : "Verify"}
				</Button>

				<Typography textAlign="center" variant="body2" mt={2}>
					Didn't receive the code?{" "}
					<Link component="button" onClick={handleResend} color="primary">
						Resend
					</Link>
				</Typography>
			</Box>
		</Box>
	);
};

export default ConfirmOTPPage;
