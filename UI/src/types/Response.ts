import type { ReviewData } from "./Review";
import type { UserDto } from "./UserDto";

export interface AuthResponse {
	token: string;
	user: {
		id: string;
		name: string;
		email: string;
		userType: "TRAVELLER" | "ACCOMMODATION_OWNER";
	};
}

export interface SignUpResponse {
	UserSub: string | undefined;
	CodeDeliveryDestination?: string | undefined;
	CodeDeliveryMedium?: "EMAIL" | "SMS" | undefined;
}

export interface GetOTPResponse {
	CodeDeliveryDestination?: string;
	CodeDeliveryMedium?: string;
}

export interface ConfirmUserResponse {
	success: boolean;
}

export interface LogInResponse {
	accessToken: string;
	idToken: string;
	expiresIn: number;
	tokenType: string | "Bearer";
	user: UserDto;
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string | null;
}

export interface ForgotPasswordSendOtpResponse {
	CodeDeliveryDestination?: string;
	CodeDeliveryMedium?: string;
}

export interface AddAccommodationToFavouriteResponse {
	id: string;
	listId: string;
	accommodationId: string;
}

export type CreateReviewResponse = ReviewData & { createdAt: Date | string };
