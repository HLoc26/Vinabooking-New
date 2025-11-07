import axios from "axios";
import { type GetOTPResponse, type ApiResponse, type SignUpResponse, type ConfirmUserResponse, type LogInResponse } from "../types/Response";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
	headers: { "Content-Type": "application/json" },
});

export const authApi = {
	register: (payload: {
		name: string; //
		email: string;
		password: string;
		phone: string;
		userType: string;
	}) => api.post<ApiResponse<SignUpResponse>>("/auth/sign-up", payload).then((r) => r.data),

	resendOtp: (
		email: string //
	) => api.get<ApiResponse<GetOTPResponse>>(`/auth/otp?email=${email}`).then((r) => r.data),

	confirmOtp: (payload: { username: string; confirmCode: string }) =>
		api //
			.post<ApiResponse<ConfirmUserResponse>>("/auth/sign-up/confirm", payload)
			.then((r) => r.data),

	login: (payload: {
		username: string; //
		password: string;
	}) => api.post<ApiResponse<LogInResponse>>("/auth/log-in", payload).then((r) => r.data),

	signOut: (accessToken: string) =>
		api
			.post<ApiResponse<{ success: boolean }>>(
				"/auth/sign-out",
				{},
				{
					withCredentials: true,
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			)
			.then((r) => r.data),
};

export default authApi;
