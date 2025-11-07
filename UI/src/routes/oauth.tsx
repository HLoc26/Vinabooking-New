import { Routes, Route } from "react-router-dom";
import { OAuthSuccessPage } from "../features/user/pages/OAuthSuccessPage";
import { OAuthErrorPage } from "../features/user/pages/OAuthErrorPage";

export const OAuthRouter = () => (
	<Routes>
		<Route path="success" element={<OAuthSuccessPage />} />
		<Route path="error" element={<OAuthErrorPage />} />
	</Routes>
);
