import PushNotificationWrapper from "./context/PushNotification/wrapper";
import { AppRouter } from "./routes";
import { useAuthCheck } from "./features/auth/hooks/useAuthCheck";
import { Box, CircularProgress } from "@mui/material";

function App() {
	// App.tsx chỉ chịu trách nhiệm render Router
	// (Sau này có thể thêm các Provider chung khác ở đây)

	const { isChecking } = useAuthCheck();
	if (isChecking) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "background.default" }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<>
			<AppRouter />
			<PushNotificationWrapper />
		</>
	);
}

export default App;
