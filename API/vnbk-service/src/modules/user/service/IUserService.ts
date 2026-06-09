import type { User } from "@/modules/user/domain/User";
import type { ERole } from "@/modules/user/enums/ERole";
import type { CreateUserRequest } from "@/modules/user/dto/request/CreateUserRequest";
import type { UpdateUserRequest } from "@/modules/user/dto/request/UpdateUserRequest";

/** A pending user cached during sign-up, before the account is confirmed. */
export interface PendingUserInfo {
	id: string;
	email: string;
	name: string;
	phone: string | null;
	role: ERole;
}

/** Use-case contract for the user module. */
export interface IUserService {
	getById(id: string): Promise<User>;
	findById(id: string): Promise<User | null>;
	getByEmail(email: string): Promise<User>;
	/** Resolves a user's role (read-through cached) — used by RolesGuard. */
	getRole(id: string): Promise<ERole>;
	create(request: CreateUserRequest): Promise<User>;
	update(id: string, request: UpdateUserRequest): Promise<User>;
	/** Sign-up support: stash pending user info in the cache, keyed by email. */
	cachePendingUser(info: PendingUserInfo): Promise<void>;
	/** Sign-up support: persist a previously cached pending user. */
	savePendingUser(email: string): Promise<User>;
	deletePendingUser(key: string): Promise<void>;
}
