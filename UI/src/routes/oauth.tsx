import { Routes, Route } from "react-router-dom";
import { OAuthSuccessPage } from "../features/auth/pages/OAuthSuccessPage";
import { OAuthErrorPage } from "../features/auth/pages/OAuthErrorPage";

export const OAuthRouter = () => (
	<Routes>
		<Route path="success" element={<OAuthSuccessPage />} />
		<Route path="error" element={<OAuthErrorPage />} />
	</Routes>
);
