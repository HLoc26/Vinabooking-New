import { Routes, Route } from "react-router-dom";
import { OAuthSuccessPage, OAuthErrorPage } from "../features/auth/pages/OAuthHandlerPage";

export const OAuthRouter = () => (
	<Routes>
		<Route path="success" element={<OAuthSuccessPage />} />
		<Route path="error" element={<OAuthErrorPage />} />
	</Routes>
);
