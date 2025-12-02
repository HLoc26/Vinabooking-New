import { Route, Routes } from "react-router-dom";
import { TravelerLayout } from "../components/layout/TravelerLayout";
import ManageBookingDetailPage from "../features/user/pages/ManageBookingDetailPage";
import UserProfilePage from "../features/user/pages/UserProfilePage";

export const UserRouter = () => {
	return (
		<Routes>
			<Route
				path="/me/profile"
				element={
					<TravelerLayout>
						<UserProfilePage />
					</TravelerLayout>
				}
			/>
			<Route
				path="/me/my-bookings"
				element={
					<TravelerLayout>
						<UserProfilePage />
					</TravelerLayout>
				}
			/>
			<Route
				path="/me/favorites"
				element={
					<TravelerLayout>
						<UserProfilePage />
					</TravelerLayout>
				}
			/>
			<Route
				path="/manage-booking/:bookingId"
				element={
					<TravelerLayout>
						<ManageBookingDetailPage />
					</TravelerLayout>
				}
			/>
		</Routes>
	);
};
