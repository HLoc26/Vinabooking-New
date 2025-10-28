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

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string | null;
}
