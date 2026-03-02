import type { ReviewDto } from "./Review";
import type { UserDto } from "../features/user/types/user.types";
import type { Address, EAccommodationType } from "../features/accommodation/types/accommodation.types";

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
	userSub: string | undefined;
	destination?: string | undefined;
	deliveryMedium?: "EMAIL" | "SMS" | undefined;
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

export interface RefreshResponse {
	accessToken: string;
	idToken: string;
	refreshToken?: string;
	expiresIn: number;
	tokenType: string;
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

export type CreateReviewResponse = ReviewDto & { createdAt: Date | string };

export interface AccommodationListItem {
	id: string;
	name: string;
	description: string;
	type: EAccommodationType;
	rentalType: string;
	isActive: boolean;
	ownerId?: string;
	createdAt?: string;
	updatedAt?: string;
	addressId?: string;
	address: Address;
	facilities: string[];
	thumbnail: string;
	rating?: number;
	reviewCount?: number;
	distance?: number;
	minPrice?: number;
}

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface AccommodationSearchData {
	data: AccommodationListItem[];
	meta: PaginationMeta;
}
