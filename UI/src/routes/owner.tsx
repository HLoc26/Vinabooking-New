import { Routes, Route } from "react-router-dom";
import OwnerLandingPage from "../features/home/pages/OwnerLandingPage";

export const OwnerRouter = () => (
	<Routes>
		<Route path="/landing" element={<OwnerLandingPage />} />
	</Routes>
);
