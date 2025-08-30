// import type AuthService from "../services/AuthService.ts";

export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    error: string | null;
}

// export type SignUpResponse = ReturnType<AuthService["signUp"]>;

export type SignUpResponse = {
    UserSub: string | undefined;
};
