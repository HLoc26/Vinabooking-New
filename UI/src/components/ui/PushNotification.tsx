import React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { type Notification } from "../../hooks/usePushNotification";

interface PushNotificationProps {
    notifications: Notification[];
    onClose: (id: string) => void;
}

export const PushNotification: React.FC<PushNotificationProps> = ({ notifications, onClose }) => {
	return (
		<>
			{notifications.map((n, index) => (
				<Snackbar
					key={n.id}
					open
					autoHideDuration={3000}
					anchorOrigin={{ vertical: "top", horizontal: "right" }}
					onClose={() => onClose(n.id)}
					sx={{
						mt: `${index * 70}px`,
					}}
				>
					<Alert
						severity={n.severity}
						variant="filled"
						onClose={() => onClose(n.id)}
						sx={{
							width: "100%",
							boxShadow: 3,
							borderRadius: 2,
							fontWeight: 500,
						}}
					>
						{n.message}
					</Alert>
				</Snackbar>
			))}
		</>
	);
};
