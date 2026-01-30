import React, { useState } from "react";
import { Box, Button, Divider, Link, TextField, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useForgotPassword } from "../hooks/useForgotPassword";
import PasswordToolbox from "../../../components/shared/PasswordToolbox";
import { getPasswordChecklist } from "../utils/validatePassword";
import OtpInput from "./OtpInput";

const ForgotPasswordVerifyPage: React.FC = () => {
	const navigate = useNavigate();
	const { state } = useLocation();
	const [values, setValues] = useState({
		email: state?.email || "",
		otp: "",
		password: "",
		confirmPassword: "",
	});
	const [checklist, setChecklist] = useState(getPasswordChecklist(""));
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [showToolbox, setShowToolbox] = useState(false);
	const { verifyOTP, loading } = useForgotPassword();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setValues((s) => ({ ...s, [name]: value }));
		if (name === "password") setChecklist(getPasswordChecklist(value));
	};

	const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
		if (e.target.name === "password") {
			setAnchorEl(e.currentTarget);
			setShowToolbox(true);
		}
	};

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		if (e.target.name === "password") setTimeout(() => setShowToolbox(false), 300);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		verifyOTP(values.email, values.otp, values.password, values.confirmPassword);
	};

	return (
		<Box component="form" onSubmit={handleSubmit}>
			<Typography variant="h5" mb={2} textAlign="center">
				Reset Password
			</Typography>
			<Typography variant="body2" textAlign="center" color="text.secondary" mb={2}>
				A verification code has been sent to <strong>{values.email}</strong>.
			</Typography>

			<OtpInput
				length={6}
				onChange={(code) =>
					handleChange({
						target: { name: "otp", value: code },
					} as React.ChangeEvent<HTMLInputElement>)
				}
			/>
			<Divider sx={{ my: 3 }} />

			<TextField //
				fullWidth
				margin="normal"
				label="New Password"
				name="password"
				type="password"
				value={values.password}
				onChange={handleChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
			/>
			<PasswordToolbox //
				anchorEl={anchorEl}
				open={showToolbox}
				checklist={checklist}
			/>
			<TextField //
				fullWidth
				margin="normal"
				label="Retype Password"
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
				{loading ? "Processing..." : "Confirm"}
			</Button>
			<Typography textAlign="center" variant="body2" mt={2}>
				Back to{" "}
				<Link component="button" onClick={() => navigate("/auth/login")} color="primary">
					Login
				</Link>
			</Typography>
		</Box>
	);
};

export default ForgotPasswordVerifyPage;
