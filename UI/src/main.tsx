import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme/theme.ts";
import PushNotificationProvider from "./context/PushNotification/provider.tsx";
import SearchProvider from "./context/SearchContext/provider.tsx";
import StatsProvider from "../src/features/home/context/StatsContext/provider.tsx";
import UserContextProvider from "./context/UserContext/provider.tsx";
import ModalProvider from "./context/ModalContext/provider.tsx";
import { BrowserRouter } from "react-router-dom";
import BookingContextProvider from "./context/BookingContext/provider.tsx";

import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { store } from "./app/store.ts";
import queryClient from "./app/queryClient.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<Provider store={store}>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider theme={theme}>
					<PushNotificationProvider>
						<UserContextProvider>
							<BookingContextProvider>
								<BrowserRouter>
									<ModalProvider>
										<StatsProvider>
											<SearchProvider>
												<CssBaseline />
												<App />
											</SearchProvider>
										</StatsProvider>
									</ModalProvider>
								</BrowserRouter>
							</BookingContextProvider>
						</UserContextProvider>
					</PushNotificationProvider>
				</ThemeProvider>
			</QueryClientProvider>
		</Provider>
	</React.StrictMode>
);
