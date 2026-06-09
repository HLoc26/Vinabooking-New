import type { User } from "@/modules/user/domain/User";
import type { ERole } from "@/modules/user/enums/ERole";

/** Domain-facing persistence port for users. Returns domain models, never Prisma types. */
export interface IUserRepository {
	findById(id: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	create(user: User): Promise<User>;
	update(user: User): Promise<User>;
	findRoleById(id: string): Promise<ERole | null>;
}
