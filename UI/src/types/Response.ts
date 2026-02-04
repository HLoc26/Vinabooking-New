import type { AccommodationAddress, EAccommodationType } from "./Accommodation";
import type { ReviewDto } from "./Review";
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
	address: AccommodationAddress;
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
