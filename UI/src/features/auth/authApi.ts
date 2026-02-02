import AxiosInstance from "../../services/apiClient";
import { type LogInResponse, type ApiResponse } from "../../types/Response";

export const login = async (payload: {
	email: string; //
	password: string;
}) => {
	const response = await AxiosInstance.post<ApiResponse<LogInResponse>>("/auth/log-in", payload).then((r) => r.data);
	if (response.data?.accessToken && response.data?.user) return response;
	throw new Error("Invalid login response");
};

export const signOut = async () => {
	return await AxiosInstance.post<ApiResponse<{ success: boolean }>>("/auth/sign-out").then((r) => r.data);
};
