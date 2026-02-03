import qs from "qs";
import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { authStorage } from "../features/auth/utils/authStorage";
import { store } from "../app/store";
import { loginSuccess, logoutSuccess } from "../features/auth/authSlice";

interface QueueItem {
	resolve: (token: string | null) => void;
	reject: (err: unknown) => void;
}

const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	paramsSerializer: {
		serialize: (params) => qs.stringify(params, { arrayFormat: "repeat" }), // <-- quan trọng
	},
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
	failedQueue.forEach((p) => {
		if (error) p.reject(error);
		else p.resolve(token);
	});
	failedQueue = [];
};

// --- Request Interceptor ---
apiClient.interceptors.request.use(
	(config) => {
		const accessToken = authStorage.getAccessToken();
		if (accessToken && config.headers) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// --- Response Interceptor ---
apiClient.interceptors.response.use(
	(res) => res,
	async (error: AxiosError) => {
		const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
		if (originalRequest.url?.includes("/auth/refresh")) {
			throw error;
		}

		if (error.response?.status !== 401 || originalRequest._retry) {
			throw error;
		}

		originalRequest._retry = true;

		if (isRefreshing) {
			return new Promise<string | null>((resolve, reject) => {
				failedQueue.push({ resolve, reject });
			}).then((newToken) => {
				if (newToken && originalRequest.headers) {
					originalRequest.headers.Authorization = `Bearer ${newToken}`;
				}
				return apiClient(originalRequest);
			});
		}

		isRefreshing = true;

		try {
			const res = await apiClient.get("/auth/refresh");
			const newAccessToken = res.data.data.accessToken as string;

			if (!newAccessToken) {
				throw new Error("Refresh token success but no access token returned");
			}

			// 1. Lưu Storage
			authStorage.setAccessToken(newAccessToken);

			// 2. Đồng bộ Redux
			const state = store.getState();
			const currentUser = state.auth.user;
			if (currentUser) {
				store.dispatch(loginSuccess({ token: newAccessToken, user: currentUser }));
			}

			// 3. Xử lý hàng chờ
			processQueue(null, newAccessToken);

			// 4. Retry request gốc
			if (originalRequest.headers) {
				originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
			}

			return apiClient(originalRequest);
		} catch (error) {
			processQueue(error, null);

			// Cleanup
			authStorage.clearAccessToken();
			authStorage.clearUser();
			store.dispatch(logoutSuccess());

			throw error;
		} finally {
			isRefreshing = false;
		}
	}
);
export default apiClient;
