import { useContext } from "react";
import PushNotificationContext from "./context";

export const usePushNotificationContext = () => {
	const ctx = useContext(PushNotificationContext);
	if (!ctx) {
		throw new Error("usePushNotificationContext must be used within PushNotificationProvider");
	}
	return ctx;
};
