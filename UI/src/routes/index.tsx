import { BrowserRouter, Routes, Route } from "react-router-dom";
import AccommodationDetailPage from "../features/accommodation/pages/DetailPage";
import { HomePage } from "../features/home/pages/Index";

import { OAuthRouter } from "./oauth";
import { AuthRouter } from "./auth";
import { BookingRouter } from "./booking";
import { TravelerLayout } from "../components/layout/TravelerLayout";

export const AppRouter = () => (
	<BrowserRouter>
		<Routes>
			{/* Traveler pages wrapped in layout */}
			<Route
				path="/"
				element={
					<TravelerLayout>
						<HomePage />
					</TravelerLayout>
				}
			/>

			{/* Auth, OAuth, Booking remain separate */}
			<Route path="/auth/*" element={<AuthRouter />} />
			<Route path="/oauth/*" element={<OAuthRouter />} />
			<Route path="/accommodation/:accommodationId" element={<AccommodationDetailPage />} />
			<Route path="/booking/*" element={<BookingRouter />} />
		</Routes>
	</BrowserRouter>
);
