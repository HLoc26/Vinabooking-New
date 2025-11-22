import axios, { AxiosError, type AxiosRequestConfig } from "axios";

interface QueueItem {
	resolve: (token: string | null) => void;
	reject: (err: unknown) => void;
}

const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
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

apiClient.interceptors.request.use(async (config) => {
	const accessToken = await cookieStore.get(import.meta.env.VITE_ACCESS_TOKEN_KEY);
	if (accessToken?.value && config.headers) {
		config.headers.Authorization = `Bearer ${accessToken.value}`;
	}
	return config;
});

apiClient.interceptors.response.use(
	(res) => res,
	async (error: AxiosError) => {
		const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

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

			if (!newAccessToken) throw new Error("Refresh token failed");

			await cookieStore.set(import.meta.env.VITE_ACCESS_TOKEN_KEY, newAccessToken);

			processQueue(null, newAccessToken);

			if (originalRequest.headers) {
				originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
			}

			return apiClient(originalRequest);
		} catch (refreshErr) {
			processQueue(refreshErr, null);
			throw refreshErr;
		} finally {
			isRefreshing = false;
		}
	}
);
export default apiClient;
