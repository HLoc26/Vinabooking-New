import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "../features/common/pages/HomePage";

import { OAuthRouter } from "./oauth";
import { AuthRouter } from "./auth";

export const AppRouter = () => (
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/auth/*" element={<AuthRouter />} />
			<Route path="/oauth/*" element={<OAuthRouter />} />
		</Routes>
	</BrowserRouter>
);
