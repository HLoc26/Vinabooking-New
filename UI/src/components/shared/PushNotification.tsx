import React from "react";
import Alert from "@mui/material/Alert";
import { motion, AnimatePresence } from "framer-motion";
import { type Notification } from "../../hooks/usePushNotification";

interface PushNotificationProps {
	notifications: Notification[];
	onClose: (id: string) => void;
}

export const PushNotification: React.FC<PushNotificationProps> = ({ notifications, onClose }) => {
	return (
		<div
			style={{
				position: "fixed",
				top: 16,
				right: 16,
				zIndex: 1500,
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-end",
				gap: 8,
			}}
		>
			<AnimatePresence mode="popLayout">
				{notifications.map((n) => (
					<motion.div
						key={n.id}
						layout
						initial={{ opacity: 0, x: 60, scale: 0.95 }}
						animate={{ opacity: 1, x: 0, scale: 1 }}
						exit={{
							opacity: 0,
							x: 60,
							scale: 0.9,
							transition: { duration: 0.35, ease: "easeInOut" },
						}}
						transition={{ duration: 0.25, ease: "easeOut" }}
					>
						<Alert
							severity={n.severity}
							variant="filled"
							onClose={() => onClose(n.id)}
							sx={{
								boxShadow: 3,
								borderRadius: 2,
								cursor: "pointer",
								minWidth: 280,
								overflow: "hidden",
							}}
						>
							{n.message}
						</Alert>
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
};
