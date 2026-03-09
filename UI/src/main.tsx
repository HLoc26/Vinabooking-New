import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import CssBaseline from "@mui/material/CssBaseline";
import PushNotificationProvider from "./context/PushNotification/provider.tsx";
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
					<PushNotificationProvider>
						<BrowserRouter>
							<CssBaseline />
							<App />
						</BrowserRouter>
					</PushNotificationProvider>
				</QueryClientProvider>
			</Provider>
		</PersistGate>
	</React.StrictMode>
);
