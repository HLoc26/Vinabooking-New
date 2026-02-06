import { Routes, Route } from "react-router-dom";
import { HomePage } from "../features/home/pages/Index";
import AccommodationDetailPage from "../features/accommodation/pages/DetailPage";
import SearchPage from "../features/accommodation/pages/AccommodationSearchResults";

import { AuthRouter } from "./auth";
import { BookingRouter } from "./booking";
import { UserRouter } from "./user";

import { TravelerLayout } from "../components/layout/TravelerLayout";
import { OAuthRouter } from "./oauth";

export const AppRouter = () => (
	<>
		<Routes>
			{/* Traveler pages */}
			<Route
				path="/"
				element={
					<TravelerLayout>
						<HomePage />
					</TravelerLayout>
				}
			/>

			<Route
				path="/search"
				element={
					<TravelerLayout>
						<SearchPage />
					</TravelerLayout>
				}
			/>

			<Route
				path="/accommodation/:accommodationId"
				element={
					<TravelerLayout>
						<AccommodationDetailPage />
					</TravelerLayout>
				}
			/>

			{/* New: accommodation type */}
			<Route
				path="/:accommodationType"
				element={
					<TravelerLayout>
						<HomePage />
					</TravelerLayout>
				}
			/>

			{/* User, Auth, OAuth, Booking */}
			<Route path="/user/*" element={<UserRouter />} />
			<Route path="/auth/*" element={<AuthRouter />} />
			<Route path="/oauth/*" element={<OAuthRouter />} />
			<Route path="/booking/*" element={<BookingRouter />} />
		</Routes>
	</>
);
