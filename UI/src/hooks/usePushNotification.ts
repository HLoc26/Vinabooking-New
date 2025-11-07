import { useState, useCallback } from "react";
import type { AlertColor } from "@mui/material";

export interface Notification {
	id: string;
	message: string;
	severity: AlertColor;
}

const MAX_NOTIFICATIONS = 5;

export function usePushNotification() {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	const pushNotification = useCallback((message: string, severity: AlertColor = "info") => {
		const id = Date.now().toString();
		const newNotification = { id, message, severity };

		setNotifications((prev) => {
			const updated = [...prev, newNotification];
			// Nếu vượt quá 5 thông báo => loại bỏ cái cũ nhất
			if (updated.length > MAX_NOTIFICATIONS) {
				updated.shift();
			}
			return updated;
		});

		// Tự ẩn sau 3 giây
		setTimeout(() => {
			setNotifications((prev) => prev.filter((n) => n.id !== id));
		}, 3000);
	}, []);

	const removeNotification = useCallback((id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	}, []);

	return { notifications, pushNotification, removeNotification };
}
