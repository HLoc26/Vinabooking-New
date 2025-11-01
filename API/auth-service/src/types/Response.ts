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
    expiresIn: number;
    tokenType: string | "Bearer";
    user: {
        id: string;
        name: string;
        email: string;
    };
}

export interface VerifyResponse {
    user: {
        id: string;
        username: string;
    };
}

export type RefreshResponse = Omit<LogInResponse, "user">;

export type GetOTPResponse = {
    CodeDeliveryDestination?: string;
    CodeDeliveryMedium?: string;
};
