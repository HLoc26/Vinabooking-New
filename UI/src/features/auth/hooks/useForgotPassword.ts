import { useState } from "react";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";
import { authApi } from "../services/authApi";
import { useNavigate } from "react-router-dom";
import { validatePassword } from "../utils/validatePassword";

export const useForgotPassword = () => {
	const [loading, setLoading] = useState(false);
	const { pushNotification } = usePushNotificationContext();
	const navigate = useNavigate();

	const requestOTP = async (email: string) => {
		if (!email) {
			pushNotification("Please enter your email", "error");
			return;
		}
		try {
			setLoading(true);
			await authApi.forgotPassword(email);
			pushNotification("OTP has been sent to your email", "success");
			navigate("/auth/forgot-password/verify", { state: { email } });
		} catch (err: unknown) {
			console.error(err);
			pushNotification("Failed to send OTP. Please try again.", "error");
		} finally {
			setLoading(false);
		}
	};

	const verifyOTP = async (email: string, otp: string, password: string, confirmPassword: string) => {
		if (!otp) return pushNotification("Please enter OTP", "error");

		const message = validatePassword(password);
		if (message !== null) return pushNotification(message, "error");

		if (password !== confirmPassword) return pushNotification("Passwords do not match", "error");

		try {
			setLoading(true);
			await authApi.confirmForgotPassword({ email, code: otp, newPassword: password });
			pushNotification("Password updated successfully", "success");
			navigate("/auth/login");
		} catch (err: unknown) {
			console.error(err);
			pushNotification("Invalid OTP or email", "error");
		} finally {
			setLoading(false);
		}
	};
	return { requestOTP, verifyOTP, loading };
};
