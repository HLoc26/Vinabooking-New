import { Routes, Route } from "react-router-dom";
import LoginPage from "../features/user/pages/LoginPage";
import RegisterPage from "../features/user/pages/RegisterPage";
import ConfirmOTPPage from "../features/user/pages/ConfirmPage";
import ForgotPasswordRequestPage from "../features/user/pages/ForgotPasswordRequestPage";
import ForgotPasswordVerifyPage from "../features/user/pages/ForgotPasswordVerifyPage";

export const AuthRouter = () => (
	<Routes>
		<Route path="/login" element={<LoginPage />} />
		<Route path="/register" element={<RegisterPage />} />
		<Route path="/otp" element={<ConfirmOTPPage />} />
		<Route path="/forgot-password" element={<ForgotPasswordRequestPage />} />
		<Route path="/forgot-password/verify" element={<ForgotPasswordVerifyPage />} />
	</Routes>
);
