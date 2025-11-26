import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme/theme.ts";
import PushNotificationProvider from "./context/PushNotification/provider.tsx";
import AuthContextProvider from "./context/AuthContext/provider.tsx";
import LocationSearchProvider from "./context/SearchContext/LocationSearchProvider.tsx";
import StatsProvider from "../src/features/home/context/StatsContext/provider.tsx";
import UserContextProvider from "./context/UserContext/provider.tsx";
import ModalProvider from "./context/ModalContext/provider.tsx";
import { BrowserRouter } from "react-router-dom";
import BookingContextProvider from "./context/BookingContext/provider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<ThemeProvider theme={theme}>
			<PushNotificationProvider>
				<AuthContextProvider>
					<UserContextProvider>
						<BookingContextProvider>
							<BrowserRouter>
								<ModalProvider>
									<StatsProvider>
										<LocationSearchProvider>
											<CssBaseline />
											<App />
										</LocationSearchProvider>
									</StatsProvider>
								</ModalProvider>
							</BrowserRouter>
						</BookingContextProvider>
					</UserContextProvider>
				</AuthContextProvider>
			</PushNotificationProvider>
		</ThemeProvider>
	</React.StrictMode>
);
