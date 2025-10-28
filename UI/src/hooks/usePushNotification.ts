import { useState, useCallback } from "react";
import type { AlertColor } from "@mui/material";

export interface Notification {
    id: string;
    message: string;
    severity: AlertColor;
}

export function usePushNotification() {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	const pushNotification = useCallback((message: string, severity: AlertColor = "info") => {
		const id = Date.now().toString();
		const newNotification = { id, message, severity };
		setNotifications((prev) => [...prev, newNotification]);

		// Hides after 3s
		setTimeout(() => {
			setNotifications((prev) => prev.filter((n) => n.id !== id));
		}, 3000);
	}, []);

	const removeNotification = useCallback((id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	}, []);

	return { notifications, pushNotification, removeNotification };
}
