import { Routes, Route } from "react-router-dom";
import OwnerLandingPage from "../features/home/pages/OwnerLandingPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ConfirmOTPPage from "../features/auth/pages/ConfirmOTPPage";
import LoginPage from "../features/auth/pages/LoginPage";
import OwnerHomePage from "../features/owner/pages/OwnerHomePage";
import { OwnerLayout } from "../components/layout/OwnerLayout";
import OwnerOnboardPage from "../features/owner/pages/OwnerOnboardPage";
import DashboardPage from "../features/owner/pages/DashboardPage";
import ManageBookingPage from "../features/owner/pages/ManageBookingPage";
import ManagePricePage from "../features/owner/pages/ManagePricePage";

export const OwnerRouter = () => (
	<Routes>
		<Route path="/landing" element={<OwnerLandingPage />} />
		<Route path="/register" element={<RegisterPage />} />
		<Route path="/login" element={<LoginPage />} />
		<Route path="/otp" element={<ConfirmOTPPage />} />
		<Route path="/onboard" element={<OwnerOnboardPage />} />
		<Route
			path="/home"
			element={
				<OwnerLayout>
					<OwnerHomePage />
				</OwnerLayout>
			}
		/>
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
	</Routes>
);
