import React, { useEffect, useRef } from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import LoginForm from "../features/auth/components/LoginForm";
import { usePushNotificationContext } from "../context/PushNotification/hook";

const LoginPage: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { pushNotification } = usePushNotificationContext();
	const hasNotified = useRef(false);

	const errorMsg = searchParams.get("error");
	const successMsg = searchParams.get("message");

	useEffect(() => {
		if (hasNotified.current) return;

		if (errorMsg) {
			pushNotification(errorMsg, "error");
			hasNotified.current = true;
			navigate("/auth/login", { replace: true });
		} else if (successMsg) {
			pushNotification(successMsg, "success");
			hasNotified.current = true;
			navigate("/auth/login", { replace: true });
		}
	}, [errorMsg, successMsg, pushNotification, navigate]);

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
						<LoginForm />
					</Box>
				</CardContent>
			</Card>
		</Box>
	);
};

export default LoginPage;
