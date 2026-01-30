import AxiosInstance from "../../services/apiClient";
import { type ApiResponse, type LogInResponse } from "../../types/Response";

export const login = (payload: {
	username: string; //
	password: string;
}) => AxiosInstance.post<ApiResponse<LogInResponse>>("/auth/log-in", payload).then((r) => r.data.data);
