import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme/theme.ts";
import PushNotificationProvider from "./context/PushNotification/provider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<ThemeProvider theme={theme}>
			<PushNotificationProvider>
				<CssBaseline />
				<App />
			</PushNotificationProvider>
		</ThemeProvider>
	</React.StrictMode>,
);
