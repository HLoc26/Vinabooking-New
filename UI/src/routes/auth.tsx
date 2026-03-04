import { Routes, Route } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ConfirmOTPPage from "../features/auth/pages/ConfirmOTPPage";
import ForgotPasswordRequestPage from "../features/auth/pages/ForgotPasswordRequestPage";
import ForgotPasswordVerifyPage from "../features/auth/pages/ForgotPasswordVerifyPage";

export const AuthRouter = () => (
	<Routes>
		<Route path="/login" element={<LoginPage />} />
		<Route path="/register" element={<RegisterPage />} />
		<Route path="/otp" element={<ConfirmOTPPage />} />
		<Route path="/forgot-password" element={<ForgotPasswordRequestPage />} />
		<Route path="/forgot-password/verify" element={<ForgotPasswordVerifyPage />} />
	</Routes>
);
