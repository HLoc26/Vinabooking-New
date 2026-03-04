import PushNotificationWrapper from "./context/PushNotification/wrapper";
import { AppRouter } from "./routes";
import { useAuthCheck } from "./features/auth/hooks/useAuthCheck";
import { Box, CircularProgress, ThemeProvider } from "@mui/material";
import darkTheme from "./theme/darkTheme";
import theme from "./theme/theme";
import { useLocation } from "react-router-dom";
import ModalProvider from "./context/ModalContext/provider";

function App() {
	// App.tsx chỉ chịu trách nhiệm render Router
	// (Sau này có thể thêm các Provider chung khác ở đây)

	const { isChecking } = useAuthCheck();
	const location = useLocation();
	if (isChecking) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "background.default" }}>
				<CircularProgress />
			</Box>
		);
	}
	const isOwnerPage = location.pathname.startsWith("/owner");
	console.log(isOwnerPage);

	return (
		<ThemeProvider theme={isOwnerPage ? darkTheme : theme}>
			<ModalProvider>
				<AppRouter />
				<PushNotificationWrapper />
			</ModalProvider>
		</ThemeProvider>
	);
}

export default App;
