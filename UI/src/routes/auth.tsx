import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ConfirmOTPPage from "../pages/ConfirmPage";
import ForgotPasswordRequestPage from "../pages/ForgotPasswordRequestPage";
import ForgotPasswordVerifyPage from "../pages/ForgotPasswordVerifyPage";

export const AuthRouter = () => (
	<Routes>
		<Route path="/login" element={<LoginPage />} />
		<Route path="/register" element={<RegisterPage />} />
		<Route path="/otp" element={<ConfirmOTPPage />} />
		<Route path="/forgot-password" element={<ForgotPasswordRequestPage />} />
		<Route path="/forgot-password/verify" element={<ForgotPasswordVerifyPage />} />
	</Routes>
);
