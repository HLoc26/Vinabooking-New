// import type AuthService from "../services/AuthService";

export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    error: string | null;
}

// export type SignUpResponse = ReturnType<AuthService["signUp"]>;

export interface SignUpResponse {
    UserSub: string | undefined;
    CodeDeliveryDestination?: string | undefined;
    CodeDeliveryMedium?: "EMAIL" | "SMS" | undefined;
}

export interface ConfirmUserResponse {
    success: boolean;
}

export interface LogInResponse {
    accessToken: string;
    idToken: string;
    refreshToken: string;
    expiresAt: number;
    tokenType: string | "Bearer";
}

export interface VerifyResponse {
    user: {
        id: string;
        username: string;
    };
}
