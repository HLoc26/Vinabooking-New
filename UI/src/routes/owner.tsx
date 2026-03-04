import { Routes, Route } from "react-router-dom";
import OwnerLandingPage from "../features/home/pages/OwnerLandingPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ConfirmOTPPage from "../features/auth/pages/ConfirmOTPPage";
import LoginPage from "../features/auth/pages/LoginPage";

export const OwnerRouter = () => (
	<Routes>
		<Route path="/landing" element={<OwnerLandingPage />} />
		<Route path="/register" element={<RegisterPage />} />
		<Route path="/login" element={<LoginPage />} />
		<Route path="/otp" element={<ConfirmOTPPage />} />
	</Routes>
);
