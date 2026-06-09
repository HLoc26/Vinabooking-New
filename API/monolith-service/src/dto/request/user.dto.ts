import { UserRole } from "@/models/user";

export interface UserCreateDto {
    id: string; // Cognito sub
    email: string;
    name: string;
    phone?: string | null;
    role?: UserRole;
}

export interface UserUpdateDto {
    name?: string;
    phone?: string | null;
}

export interface UserCacheInfo {
    email: string;
    info: UserCreateDto;
}
