import { usePushNotification } from "../../hooks/usePushNotification";
import PushNotificationContext from "./context";

const PushNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const pushNotification = usePushNotification();
	return (
		<PushNotificationContext.Provider value={pushNotification}>
			{children}
		</PushNotificationContext.Provider>
	);
};

export default PushNotificationProvider;
