import AxiosInstance from "../../../services/apiClient";
import { type GetOTPResponse, type ApiResponse, type SignUpResponse, type ConfirmUserResponse, type LogInResponse, type ForgotPasswordSendOtpResponse } from "../types/Response";

export const authApi = {
	register: (payload: {
		name: string; //
		email: string;
		password: string;
		phone: string;
		userType: string;
	}) => AxiosInstance.post<ApiResponse<SignUpResponse>>("/auth/sign-up", payload).then((r) => r.data),

	resendOtp: (
		email: string //
	) => AxiosInstance.get<ApiResponse<GetOTPResponse>>(`/auth/otp?email=${email}`).then((r) => r.data),

	confirmOtp: (payload: { username: string; confirmCode: string }) =>
		AxiosInstance.post<ApiResponse<ConfirmUserResponse>>("/auth/sign-up/confirm", payload) //
			.then((r) => r.data),

	login: (payload: {
		username: string; //
		password: string;
	}) => AxiosInstance.post<ApiResponse<LogInResponse>>("/auth/log-in", payload).then((r) => r.data),

	signOut: (accessToken: string) =>
		AxiosInstance.post<ApiResponse<{ success: boolean }>>(
			"/auth/sign-out",
			{},
			{
				withCredentials: true,
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		).then((r) => r.data),
	forgotPassword: (email: string) =>
		AxiosInstance.post<ApiResponse<ForgotPasswordSendOtpResponse>>("/auth/forgot-password", { email }) //
			.then((r) => r.data),

	confirmForgotPassword: (payload: {
		email: string; //
		code: string;
		newPassword: string;
	}) =>
		AxiosInstance.post<ApiResponse<{ success: boolean }>>("/auth/forgot-password/confirm", payload) //
			.then((r) => r.data),
};

export default authApi;
