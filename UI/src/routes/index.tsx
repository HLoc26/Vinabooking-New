import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "../features/common/pages/HomePage";
import LoginPage from "../features/user/pages/LoginPage";
import RegisterPage from "../features/user/pages/RegisterPage";
import ConfirmOTPPage from "../features/user/pages/ConfirmPage";
import { OAuthSuccessPage } from "../features/user/pages/OAuthSuccessPage";
import { OAuthErrorPage } from "../features/user/pages/OAuthErrorPage";

export const AppRouter = () => (
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/register" element={<RegisterPage />} />
			<Route path="/otp" element={<ConfirmOTPPage />} />
			<Route path="/oauth/success" element={<OAuthSuccessPage />} />
			<Route path="/oauth/error" element={<OAuthErrorPage />} />
		</Routes>
	</BrowserRouter>
);
