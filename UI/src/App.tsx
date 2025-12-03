import PushNotificationWrapper from "./context/PushNotification/wrapper";
import { AppRouter } from "./routes";

function App() {
	// App.tsx chỉ chịu trách nhiệm render Router
	// (Sau này có thể thêm các Provider chung khác ở đây)
	return (
		<>
			<AppRouter />
			<PushNotificationWrapper />
		</>
	);
}

export default App;
