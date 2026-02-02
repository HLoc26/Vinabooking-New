import { Routes, Route } from "react-router-dom";
import { OAuthSuccessPage } from "../pages/OAuthSuccessPage";
import { OAuthErrorPage } from "../pages/OAuthErrorPage";

export const OAuthRouter = () => (
	<Routes>
		<Route path="success" element={<OAuthSuccessPage />} />
		<Route path="error" element={<OAuthErrorPage />} />
	</Routes>
);
