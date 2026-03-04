import React, { useState } from "react";
import { Box, Button, TextField, Typography, Link, Divider } from "@mui/material";
import { MuiTelInput } from "mui-tel-input";

import { useNavigate } from "react-router-dom";

import { useRegister } from "../../auth/hooks/useRegister";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";

import UserSwitcher from "../../../components/shared/UserSwitcher";
import PasswordToolbox from "../../../components/shared/PasswordToolbox";
import type { EUserType } from "../../user/types/user.types";

import { validatePassword, getPasswordChecklist } from "../utils/validatePassword";
import { GoogleAuthButton } from "../../../components/shared/GoogleAuthButton";

interface RegisterFormProps {
	defaultUserType: EUserType;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ defaultUserType = "TRAVELLER" }) => {
	const [values, setValues] = useState({
		name: "",
		email: "",
		password: "",
		phone: "",
		confirmPassword: "",
		userType: defaultUserType,
	});

	const [checklist, setChecklist] = useState(getPasswordChecklist(""));
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [showToolbox, setShowToolbox] = useState(false);

	const { mutateAsync: register, isPending: loading } = useRegister();
	const navigate = useNavigate();
	const { pushNotification } = usePushNotificationContext();

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
			const response = await register({
				name: values.name,
				email: values.email,
				password: values.password,
				phone: values.phone,
				userType: values.userType,
			});
			if (!response) throw new Error("");
			navigate("/auth/otp", {
				state: {
					destination: response.destination,
					medium: response.medium,
					email: values.email,
					id: response.id,
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
				<Link component="button" onClick={() => navigate("/auth/login")} color="primary">
					Login
				</Link>
			</Typography>
			<Box display="flex" flexDirection="column" alignItems="center" width="100%">
				<Box display="flex" alignItems="center" width="100%" sx={{ my: 2 }}>
					<Divider sx={{ flexGrow: 1 }} />
					<Typography variant="body2" sx={{ mx: 2, color: "text.secondary", whiteSpace: "nowrap" }}>
						or
					</Typography>
					<Divider sx={{ flexGrow: 1 }} />
				</Box>

				<GoogleAuthButton />
			</Box>
		</Box>
	);
};

export default RegisterForm;
