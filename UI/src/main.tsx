import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme/theme.ts";
import PushNotificationProvider from "./context/PushNotification/provider.tsx";
import StatsProvider from "../src/features/home/context/StatsContext/provider.tsx";
import ModalProvider from "./context/ModalContext/provider.tsx";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./app/store.ts";

import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./app/queryClient.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<PersistGate loading={null} persistor={persistor}>
			<Provider store={store}>
				<QueryClientProvider client={queryClient}>
					<ThemeProvider theme={theme}>
						<PushNotificationProvider>
							<BrowserRouter>
								<ModalProvider>
									<StatsProvider>
										<CssBaseline />
										<App />
									</StatsProvider>
								</ModalProvider>
							</BrowserRouter>
						</PushNotificationProvider>
					</ThemeProvider>
				</QueryClientProvider>
			</Provider>
		</PersistGate>
	</React.StrictMode>
);
