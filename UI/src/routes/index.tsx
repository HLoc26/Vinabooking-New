import { Routes, Route } from "react-router-dom";
import { HomePage } from "../features/home/pages/Index";
import AccommodationDetailPage from "../features/accommodation/pages/DetailPage";
import SearchPage from "../features/accommodation/pages/AccommodationSearchResults";

import { OAuthRouter } from "./oauth";
import { AuthRouter } from "./auth";
import { BookingRouter } from "./booking";

import { TravelerLayout } from "../components/layout/TravelerLayout";
import UserProfilePage from "../features/user/pages/UserProfilePage";
import ManageBookingDetailPage from "../features/user/pages/ManageBookingDetailPage";

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

			{/* User pages */}
			<Route
				path="/user/me"
				element={
					<TravelerLayout>
						<UserProfilePage />
					</TravelerLayout>
				}
			/>

			<Route
				path="/user/manage-booking/:bookingId"
				element={
					<TravelerLayout>
						<ManageBookingDetailPage />
					</TravelerLayout>
				}
			/>

			{/* Auth, OAuth, Booking */}
			<Route path="/auth/*" element={<AuthRouter />} />
			<Route path="/oauth/*" element={<OAuthRouter />} />
			<Route path="/booking/*" element={<BookingRouter />} />
		</Routes>
	</>
);
