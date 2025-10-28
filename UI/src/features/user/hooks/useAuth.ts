import { useCallback, useState } from "react";
import { authApi } from "../services/authApi";
import type { ApiResponse, LogInResponse } from "../types/Response";
import { usePushNotification } from "../../../hooks/usePushNotification";
import { AxiosError } from "axios";

const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY;
const USER_KEY = import.meta.env.VITE_USER_KEY;

export const useAuth = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { pushNotification } = usePushNotification();

	const login = useCallback(async (email: string, password: string) => {
		setLoading(true);
		setError(null);
		try {
			const response: ApiResponse<LogInResponse> = await authApi.login({
				username: email,
				password,
			});

			if (!response.data) {
				throw new Error(response.error as string);
			}
			const data = response.data;

			cookieStore.set(ACCESS_TOKEN_KEY, data.accessToken);
			localStorage.setItem(USER_KEY, JSON.stringify(data.user));

			return true;
		} catch (e: unknown) {
			if (e instanceof AxiosError) {
				setError(e.response?.data.error);
				throw new Error(e.response?.data.error);
			} else {
				const err = e as Error;
				setError(err.message || "Error while register");
				throw new Error(err.message || "Error while register");
			}
		} finally {
			setLoading(false);
		}
	}, []);

	const logout = useCallback(() => {
		cookieStore.delete(ACCESS_TOKEN_KEY);
		localStorage.removeItem(USER_KEY);
		// optional: trigger redirect outside
	}, []);

	const getCurrentUser = useCallback(() => {
		const raw = localStorage.getItem(USER_KEY);
		if (!raw) return null;
		try {
			return JSON.parse(raw);
		} catch (e) {
			const error = e as Error;
			pushNotification(error.message, "error");
			return null;
		}
	}, [pushNotification]);

	return { login, logout, getCurrentUser, loading, error } as const;
};

export default useAuth;
