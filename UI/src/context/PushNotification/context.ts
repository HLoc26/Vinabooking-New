import React from "react";
import type { usePushNotification } from "../../hooks/usePushNotification";

const PushNotificationContext = React.createContext<ReturnType<typeof usePushNotification> | null>(
	null,
);

export default PushNotificationContext;
