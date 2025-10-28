import React, { useState } from "react";
import { Box, Button, TextField, Typography, Link } from "@mui/material";
import { MuiTelInput } from "mui-tel-input";

import { useNavigate } from "react-router-dom";

import useRegister from "../hooks/useRegister";

import { usePushNotification } from "../../../hooks/usePushNotification";
import { PushNotification } from "../../../components/ui/PushNotification";

import UserSwitcher from "./UserSwitcher";
import PasswordToolbox from "./PasswordToolbox";
import type { EUserType } from "../types/UserDto";

import { validatePassword, getPasswordChecklist } from "../utils/validatePassword";

const RegisterForm: React.FC = () => {
	const [values, setValues] = useState({
		name: "",
		email: "",
		password: "",
		phone: "",
		confirmPassword: "",
		userType: "TRAVELLER" as EUserType,
	});

	const [checklist, setChecklist] = useState(getPasswordChecklist(""));
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [showToolbox, setShowToolbox] = useState(false);

	const { register, loading } = useRegister();
	const navigate = useNavigate();
	const { notifications, pushNotification, removeNotification } = usePushNotification();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setValues((s) => ({ ...s, [name]: value }));
		if (name === "password") setChecklist(getPasswordChecklist(value));
	};

	const handleChangePhone = (newValue: string) => {
		setValues((s) => ({ ...s, phone: newValue }));
	};

	const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
		if (e.target.name === "password") {
			setAnchorEl(e.currentTarget);
			setShowToolbox(true);
		}
	};

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		if (e.target.name === "password") {
			// Delay để tránh tắt quá sớm nếu người dùng click trong toolbox
			setTimeout(() => setShowToolbox(false), 300);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!values.name) return pushNotification("Accommodation owner might want to know your name", "error");
		if (!values.email) return pushNotification("We need your email to send you updates about your bookings", "error");

		const message = validatePassword(values.password);
		if (message !== null) return pushNotification(message, "error");

		if (values.password !== values.confirmPassword) return pushNotification("Woah, make sure the two passwords you just typed in are the same", "error");

		try {
			const response = await register(values.name, values.email, values.password, values.phone, values.userType);
			if (!response) throw new Error("");
			navigate("/otp", {
				state: {
					destination: response.destination,
					medium: response.medium,
					email: values.email,
				},
			});
		} catch (e) {
			const error = e as Error;
			console.log(error);
			pushNotification(error.message, "error");
		}
	};

	return (
		<Box component="form" onSubmit={handleSubmit}>
			<Box display="flex" justifyContent="center">
				<UserSwitcher value={values.userType} onChange={(v) => setValues((s) => ({ ...s, userType: v }))} />
			</Box>

			<TextField //
				fullWidth
				margin="normal"
				label="Fullname"
				name="name"
				value={values.name}
				onChange={handleChange}
			/>

			<MuiTelInput
				value={values.phone}
				onChange={(value, info) => {
					console.log(value, info);
					console.log(values.phone);
					handleChangePhone(value);
				}}
				label="Phone"
				name="phone"
				margin="normal"
				fullWidth
			/>

			<TextField //
				fullWidth
				margin="normal"
				label="Email"
				name="email"
				type="email"
				value={values.email}
				onChange={handleChange}
			/>
			<TextField //
				fullWidth
				margin="normal"
				label="Password"
				name="password"
				type="password"
				value={values.password}
				onChange={handleChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
			/>

			{/* Toolbox popup */}
			<PasswordToolbox anchorEl={anchorEl} open={showToolbox} checklist={checklist} />

			<TextField //
				fullWidth
				margin="normal"
				label="Retype password"
				name="confirmPassword"
				type="password"
				value={values.confirmPassword}
				onChange={handleChange}
			/>

			<Button //
				fullWidth
				variant="contained"
				color="secondary"
				type="submit"
				sx={{ mt: 2, py: 1.2 }}
				disabled={loading}
			>
				{loading ? "Processing..." : "Register"}
			</Button>

			<Typography variant="body2" textAlign="center" mt={2}>
				Already have an account?{" "}
				<Link component="button" onClick={() => navigate("/login")} color="primary">
					Login
				</Link>
			</Typography>

			<PushNotification notifications={notifications} onClose={removeNotification} />
		</Box>
	);
};

export default RegisterForm;
