import AxiosInstance from "../../services/apiClient";
import type { LogInResponse, ApiResponse, SignUpResponse, RefreshResponse, GetOTPResponse, ConfirmUserResponse, ForgotPasswordSendOtpResponse } from "../../types/Response";

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

export const getGoogleAuthUrl = () => {
	const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
	let API_URL = import.meta.env.VITE_API_URL;

	// Fix lỗi dư dấu / (Không hiểu dư mặc dù .env set không có dấu /)
	if (API_URL.endsWith("/")) {
		API_URL = API_URL.slice(0, -1);
	}

	const redirectUri = `${API_URL}/auth/google/callback`;

	const scope = ["openid", "email", "profile"].join(" ");

	const params = new URLSearchParams({
		client_id: GOOGLE_CLIENT_ID,
		redirect_uri: redirectUri,
		response_type: "code",
		scope,
		access_type: "offline",
		prompt: "consent",
	});

	return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const refreshToken = async () => {
	return await AxiosInstance.get<ApiResponse<RefreshResponse>>("/auth/refresh").then((r) => r.data);
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

export const confirmOtp = async (payload: { id: string; email: string; confirmCode: string }) =>
	AxiosInstance.post<ApiResponse<ConfirmUserResponse>>("/auth/sign-up/confirm", payload) //
		.then((r) => r.data);

export const forgotPassword = async (email: string) =>
	AxiosInstance.post<ApiResponse<ForgotPasswordSendOtpResponse>>("/auth/forgot-password", { email }) //
		.then((r) => r.data);

export const confirmForgotPassword = async (payload: {
	email: string; //
	code: string;
	newPassword: string;
}) =>
	AxiosInstance.post<ApiResponse<{ success: boolean }>>("/auth/forgot-password/confirm", payload) //
		.then((r) => r.data);
