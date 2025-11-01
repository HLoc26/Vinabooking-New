import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";

const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY;
const USER_KEY = import.meta.env.VITE_USER_KEY;

interface OAuthUser {
	id: string;
	email: string;
	name: string;
}

export const useOAuthCallback = () => {
	const navigate = useNavigate();
	const { pushNotification } = usePushNotificationContext();

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const handleOAuthCallback = useCallback(async () => {
		try {
			const params = new URLSearchParams(window.location.search);
			const message = params.get("message");

			// Have message in params means it is redirected from /oauth/error
			if (message) {
				const decoded = decodeURIComponent(message);
				setError(decoded);
				pushNotification(decoded, "error");
				navigate("/login");
				return;
			}

			const accessToken = params.get("accessToken");
			const idToken = params.get("idToken");
			const userRaw = params.get("user");

			if (!accessToken || !idToken || !userRaw) {
				throw new Error("Invalid or missing OAuth response.");
			}

			const user: OAuthUser = JSON.parse(decodeURIComponent(userRaw));

			await cookieStore.set(ACCESS_TOKEN_KEY, accessToken);
			localStorage.setItem(USER_KEY, JSON.stringify(user));

			pushNotification("Successfully logged in with Google!", "success");
			setTimeout(() => navigate("/"), 800);
		} catch (err) {
			const e = err as Error;
			setError(e.message);
			pushNotification(e.message, "error");
			setTimeout(() => navigate("/login"), 1000);
		} finally {
			setLoading(false);
		}
	}, [navigate, pushNotification]);

	useEffect(() => {
		handleOAuthCallback();
	}, [handleOAuthCallback]);

	return { loading, error };
};
