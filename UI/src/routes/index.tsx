import { Routes, Route } from "react-router-dom";
import { HomePage } from "../features/common/pages/HomePage";
import AccommodationDetailPage from "../features/accommodation/pages/DetailPage";
import SearchPage from "../features/accommodation/pages/SearchPage";

import { OAuthRouter } from "./oauth";
import { AuthRouter } from "./auth";
import { BookingRouter } from "./booking";
import { TravelerLayout } from "../components/layout/TravelerLayout";
import UserProfilePage from "../features/user/pages/UserProfilePage";
import ManageBookingDetailPage from "../features/user/pages/ManageBookingDetailPage";

export const AppRouter = () => (
	<>
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
			<Route path="/search" element={<SearchPage />} />
			<Route path="/accommodation/:accommodationId" element={<AccommodationDetailPage />} />
			<Route path="/booking/*" element={<BookingRouter />} />
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
						<ManageBookingDetailPage />{" "}
					</TravelerLayout>
				}
			/>
		</Routes>
	</>
);
