import { useCallback, useState } from "react";
import { authApi } from "../services/authApi";
import type { ApiResponse, LogInResponse } from "../types/Response";
import { AxiosError } from "axios";
import type { UserDto } from "../types/UserDto";

const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY;
const USER_KEY = import.meta.env.VITE_USER_KEY;

export const useAuth = () => {
	const [user, setUser] = useState<UserDto | null>(() => {
		const raw = localStorage.getItem(USER_KEY);
		if (!raw) return null;
		try {
			return JSON.parse(raw);
		} catch (e) {
			const error = e as Error;
			console.error(error.message);
			return null;
		}
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
			setUser(data.user);

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

	const logout = useCallback(async () => {
		try {
			const accessToken = await cookieStore.get(ACCESS_TOKEN_KEY);
			if (!accessToken || !accessToken.value) {
				throw new Error("You are not logged in.");
			}
			const response = await authApi.signOut(accessToken.value);

			if (!response.data?.success) {
				throw new Error(response.error as string);
			}
			cookieStore.delete(ACCESS_TOKEN_KEY);
			localStorage.removeItem(USER_KEY);
			setUser(null);
			return true;
		} catch (e: unknown) {
			if (e instanceof AxiosError) {
				setError(e.response?.data.error);
				throw new Error(e.response?.data.error);
			} else {
				const err = e as Error;
				setError(err.message || "Error while signing out");
				throw new Error(err.message || "Error while signing out");
			}
		}
	}, []);

	const getCurrentUser = useCallback(() => {
		return user;
	}, [user]);

	const updateUserInStorage = useCallback((updatedUser: UserDto) => {
		localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
		setUser(updatedUser);
	}, []);

	return { login, logout, getCurrentUser, updateUserInStorage, loading, error } as const;
};

export default useAuth;
