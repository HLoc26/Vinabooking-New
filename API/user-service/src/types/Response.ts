import type User from "../classes/User.ts";

export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    error: string | null;
}

export type UserResponse = ReturnType<User["toJson"]>;
