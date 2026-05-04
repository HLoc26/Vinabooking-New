import { Routes, Route } from "react-router-dom";
import { HomePage } from "../features/home/pages/Index";
import AccommodationDetailPage from "../features/accommodation/pages/DetailPage";
import SearchResultPage from "../features/accommodation/pages/SearchResultPage";

import { AuthRouter } from "./auth";
import { BookingRouter } from "./booking";
import { UserRouter } from "./user";

import { SemanticSearchPage } from "../features/search/semantic-search/SemanticSearchPage";
import { SemanticSearchLoadingPage } from "../features/search/semantic-search/SemanticSearchLoadingPage";
import { SemanticSearchResultsPage } from "../features/search/semantic-search/SemanticSearchResultsPage";

import { TravelerLayout } from "../components/layout/TravelerLayout";
import { OAuthRouter } from "./oauth";
import { OwnerRouter } from "./owner";

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
						<SearchResultPage />
					</TravelerLayout>
				}
			/>

			{/* Semantic Search Pages */}
			<Route path="/search/semantic" element={<TravelerLayout><SemanticSearchPage /></TravelerLayout>} />
			<Route path="/search/semantic/loading" element={<SemanticSearchLoadingPage />} />
			<Route path="/search/semantic/results" element={<TravelerLayout><SemanticSearchResultsPage /></TravelerLayout>} />

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
			<Route path="/owner/*" element={<OwnerRouter />} />
		</Routes>
	</>
);
