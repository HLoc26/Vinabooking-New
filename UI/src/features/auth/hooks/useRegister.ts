import React from "react";
import { authApi } from "../../../services/authApi";
import type { ApiResponse, SignUpResponse } from "../../../types/Response";
import { AxiosError } from "axios";
import { register, resendOtp, confirmOtp } from "../../auth/authApi";
import { useMutation } from "@tanstack/react-query";

export const useRegisterLegacy = () => {
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const register = React.useCallback(async (name: string, email: string, password: string, phone: string, userType: string) => {
		setLoading(true);
		setError(null);
		try {
			const response: ApiResponse<SignUpResponse> = await authApi.register({
				name,
				email,
				password,
				phone,
				userType,
			});

			if (!response.data) {
				console.log(response.error);
				throw new Error(response.error as string);
			}
			const data = response.data;

			setLoading(false);
			return {
				destination: data.CodeDeliveryDestination || "your email",
				medium: data.CodeDeliveryMedium || "EMAIL",
			};
		} catch (e: unknown) {
			setLoading(false);
			if (e instanceof AxiosError) {
				setError(e.response?.data.error);
				throw new Error(e.response?.data.error);
			} else {
				const err = e as Error;
				setError(err.message || "Error while register");
				throw new Error(err.message || "Error while register");
			}
		}
	}, []);

	const resendOtp = React.useCallback(async (email: string) => {
		try {
			setLoading(true);
			setError(null);

			const response = await authApi.resendOtp(email);

			const data = response.data;

			if (!data) {
				throw new Error(response.error as string);
			}

			return {
				destination: data.CodeDeliveryDestination || "your email",
				medium: data.CodeDeliveryMedium || "EMAIL",
			};
		} catch (e: unknown) {
			if (e instanceof AxiosError) {
				setError(e.response?.data.error);
				throw new Error(e.response?.data.error);
			} else {
				const err = e as Error;
				setError(err.message || "Error while sending OTP");
				throw new Error(err.message || "Error while sending OTP");
			}
		}
	}, []);

	const confirmOtp = React.useCallback(async (email: string, confirmCode: string) => {
		try {
			setLoading(true);
			setError(null);

			const response = await authApi.confirmOtp({ username: email, confirmCode });

			const data = response.data;

			if (!data) {
				throw new Error(response.error as string);
			}

			return data.success;
		} catch (e) {
			if (e instanceof AxiosError) {
				setError(e.response?.data.error);
				throw new Error(e.response?.data.error);
			} else {
				const err = e as Error;
				setError(err.message || "Error while confirming OTP");
				throw new Error(err.message || "Error while confirming OTP");
			}
		}
	}, []);

	return { register, resendOtp, confirmOtp, loading, error } as const;
};

export const useRegister = () => {
	return useMutation({
		mutationFn: async (payload: { name: string; email: string; password: string; phone: string; userType: string }) => {
			const response: ApiResponse<SignUpResponse> = await register(payload);

			if (!response.data) {
				throw new Error(response.error as string);
			}

			return {
				destination: response.data.CodeDeliveryDestination || "your email",
				medium: response.data.CodeDeliveryMedium || "EMAIL",
			};
		},
	});
};
export const useResendOtp = () => {
	return useMutation({
		mutationFn: async (email: string) => {
			const response = await resendOtp(email);
			if (!response.data) {
				throw new Error(response.error as string);
			}
			return {
				destination: response.data.CodeDeliveryDestination || "your email",
				medium: response.data.CodeDeliveryMedium || "EMAIL",
			};
		},
	});
};

export const useConfirmOtp = () => {
	return useMutation({
		mutationFn: async (payload: { email: string; confirmCode: string }) => {
			const response = await confirmOtp({ username: payload.email, confirmCode: payload.confirmCode });
			if (!response.data) {
				throw new Error(response.error as string);
			}
			return response.data.success;
		},
	});
};

export default useRegisterLegacy;
