import { Routes, Route } from "react-router-dom";
import OwnerLandingPage from "../features/home/pages/OwnerLandingPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ConfirmOTPPage from "../features/auth/pages/ConfirmOTPPage";
import LoginPage from "../features/auth/pages/LoginPage";
import { OwnerLayout } from "../components/layout/OwnerLayout";
import OwnerOnboardPage from "../features/owner/pages/OwnerOnboardPage";
import DashboardPage from "../features/owner/pages/DashboardPage";
import ManageBookingPage from "../features/owner/pages/ManageBookingPage";
import ManagePricePage from "../features/owner/pages/ManagePricePage";
import DraftsPage from "../features/owner/pages/DraftsPage";
import OwnerCreateAccomPage from "../features/owner/pages/OwnerCreateAccomPage";
import ManageAccommodationPage from "../features/owner/pages/ManageAccommodationPage";

export const OwnerRouter = () => (
	<Routes>
		<Route path="/landing" element={<OwnerLandingPage />} />
		<Route path="/register" element={<RegisterPage />} />
		<Route path="/login" element={<LoginPage />} />
		<Route path="/otp" element={<ConfirmOTPPage />} />
		<Route path="/onboard" element={<OwnerOnboardPage />} />
		<Route path="/create/:draftId?" element={<OwnerCreateAccomPage />} />
		<Route
			path="/dashboard"
			element={
				<OwnerLayout>
					<DashboardPage />
				</OwnerLayout>
			}
		/>
		<Route
			path="/manage-booking"
			element={
				<OwnerLayout>
					<ManageBookingPage />
				</OwnerLayout>
			}
		/>
		<Route
			path="/manage-price"
			element={
				<OwnerLayout>
					<ManagePricePage />
				</OwnerLayout>
			}
		/>
		<Route
			path="/drafts"
			element={
				<OwnerLayout>
					<DraftsPage />
				</OwnerLayout>
			}
		/>
		<Route
			path="/accommodations/:accommodationId"
			element={
				<OwnerLayout>
					<ManageAccommodationPage />
				</OwnerLayout>
			}
		/>
	</Routes>
);
