import React, { useState } from "react";
import { Box, Button, TextField, Typography, Link } from "@mui/material";
import UserSwitcher from "./UserSwitcher";
import useAuth from "../hooks/useAuth";
import type { EUserType } from "../types/UserDto";
import { usePushNotification } from "../../../hooks/usePushNotification";
import { PushNotification } from "../../../components/ui/PushNotification";
import { useNavigate } from "react-router-dom";

const LoginForm: React.FC = () => {
	const navigate = useNavigate();
	const [values, setValues] = useState({
		email: "",
		password: "",
		userType: "TRAVELLER" as EUserType,
	});
	const { login, loading } = useAuth();

	const { notifications, pushNotification, removeNotification } = usePushNotification();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
		setValues((s) => ({ ...s, [e.target.name]: e.target.value }));

	const handleUserType = (v: EUserType) => setValues((s) => ({ ...s, userType: v }));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!values.email) return pushNotification("You can't have an empty email, can you?");
		if (!values.password) return pushNotification("You need to enter your password");

		try {
			const success = await login(values.email, values.password);
			if (success) {
				pushNotification("Login success", "success");
			}
			navigate("/");
		} catch (err) {
			const error = err as Error;
			pushNotification(error.message, "error");
		}
	};

	return (
		<Box component="form" onSubmit={handleSubmit}>
			<Box display="flex" justifyContent="center" mb={2}>
				<UserSwitcher value={values.userType} onChange={handleUserType} />
			</Box>

			<TextField
				fullWidth
				margin="normal"
				label="Email"
				name="email"
				type="email"
				value={values.email}
				onChange={handleChange}
			/>

			<TextField
				fullWidth
				margin="normal"
				label="Password"
				name="password"
				type="password"
				value={values.password}
				onChange={handleChange}
			/>

			<Button
				fullWidth
				variant="contained"
				color="primary"
				type="submit"
				sx={{ mt: 2, py: 1.2 }}
				disabled={loading}
			>
				{loading ? "Processing..." : "Log in"}
			</Button>

			<Typography textAlign="center" variant="body2" mt={2}>
                Chưa có tài khoản?{" "}
				<Link href="/register" color="primary">
                    Register now
				</Link>
			</Typography>
			<PushNotification notifications={notifications} onClose={removeNotification} />
		</Box>
	);
};

export default LoginForm;
