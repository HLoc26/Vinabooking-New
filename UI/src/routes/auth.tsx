import { Routes, Route } from "react-router-dom";
import LoginPage from "../features/user/pages/LoginPage";
import RegisterPage from "../features/user/pages/RegisterPage";
import ConfirmOTPPage from "../features/user/pages/ConfirmPage";

export const AuthRouter = () => (
	<Routes>
		<Route path="/login" element={<LoginPage />} />
		<Route path="/register" element={<RegisterPage />} />
		<Route path="/otp" element={<ConfirmOTPPage />} />
	</Routes>
);
