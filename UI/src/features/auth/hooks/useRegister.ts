import type { ApiResponse, SignUpResponse } from "../../../types/Response";
import { register, resendOtp, confirmOtp } from "../../auth/authApi";
import { useMutation } from "@tanstack/react-query";

export const useRegister = () => {
	return useMutation({
		mutationFn: async (payload: { name: string; email: string; password: string; phone: string; userType: string }) => {
			const response: ApiResponse<SignUpResponse> = await register(payload);

			if (!response.data) {
				throw new Error(response.error as string);
			}
			return {
				destination: response.data.destination || "your email",
				medium: response.data.deliveryMedium || "EMAIL",
				id: response.data.userSub,
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
		mutationFn: async (payload: { email: string; confirmCode: string; id: string }) => {
			const response = await confirmOtp({ id: payload.id, email: payload.email, confirmCode: payload.confirmCode });
			if (!response.data) {
				throw new Error(response.error as string);
			}
			return response.data.success;
		},
	});
};
