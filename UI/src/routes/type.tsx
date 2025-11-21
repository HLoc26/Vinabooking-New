import { Routes, Route } from "react-router-dom";
import { AcommodationTypePage } from "../features/accommodation-type/pages/AccommodationTypePage";

export const TypeRouter = () => (
	<Routes>
		<Route path=":accommodationType" element={<AcommodationTypePage />} />
		{/* <Route path="/city/:cityName" element={<CityTypePage />} /> */}
	</Routes>
);
