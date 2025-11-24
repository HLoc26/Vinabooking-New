import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme/theme.ts";
import PushNotificationProvider from "./context/PushNotification/provider.tsx";
import AuthContextProvider from "./context/AuthContext/provider.tsx";
import UserContextProvider from "./context/UserContext/provider.tsx";
import BookingContextProvider from "./context/BookingContext/provider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<ThemeProvider theme={theme}>
			<PushNotificationProvider>
				<AuthContextProvider>
					<UserContextProvider>
						<BookingContextProvider>
							<CssBaseline />
							<App />
						</BookingContextProvider>
					</UserContextProvider>
				</AuthContextProvider>
			</PushNotificationProvider>
		</ThemeProvider>
	</React.StrictMode>
);
