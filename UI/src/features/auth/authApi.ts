import AxiosInstance from "../../services/apiClient";
import { type LogInResponse, type ApiResponse, type SignUpResponse, type GetOTPResponse, type ConfirmUserResponse } from "../../types/Response";

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

export const register = async (payload: {
	name: string; //
	email: string;
	password: string;
	phone: string;
	userType: string;
}) => AxiosInstance.post<ApiResponse<SignUpResponse>>("/auth/sign-up", payload).then((r) => r.data);

export const resendOtp = async (
	email: string //
) => AxiosInstance.get<ApiResponse<GetOTPResponse>>(`/auth/otp?email=${email}`).then((r) => r.data);

export const confirmOtp = async (payload: { username: string; confirmCode: string }) =>
	AxiosInstance.post<ApiResponse<ConfirmUserResponse>>("/auth/sign-up/confirm", payload) //
		.then((r) => r.data);
