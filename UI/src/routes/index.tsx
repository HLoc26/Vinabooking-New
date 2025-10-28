import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "../features/common/pages/HomePage";

import { OAuthRouter } from "./oauth";
import { AuthRouter } from "./auth";
import BookingPreviewPage from "../features/booking/pages/BookingPreviewPage";
import CheckoutPage from "../features/booking/pages/CheckoutPage";

export const AppRouter = () => (
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/auth/*" element={<AuthRouter />} />
			<Route path="/oauth/*" element={<OAuthRouter />} />
			<Route path="/booking" element={<BookingPreviewPage />} />
			<Route path="/checkout" element={<CheckoutPage />} />
		</Routes>
	</BrowserRouter>
);
