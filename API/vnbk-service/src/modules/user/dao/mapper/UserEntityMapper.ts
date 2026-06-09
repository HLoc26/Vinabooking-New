import { injectable } from "tsyringe";
import { type User as PrismaUser, Prisma } from "@/generated/client";
import type { IMapper } from "@/shared/mapper/IMapper";
import { User } from "@/modules/user/domain/User";

/** Maps between the Prisma User entity and the User domain model. DAO-only. */
@injectable()
export class UserEntityMapper implements IMapper<User, PrismaUser> {
	public toDomain(entity: PrismaUser): User {
		return User.rehydrate({
			id: entity.id,
			email: entity.email,
			name: entity.name,
			phone: entity.phone,
			role: entity.role,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		});
	}

	public toCreateInput(user: User): Prisma.UserCreateInput {
		return {
			id: user.id,
			email: user.email,
			name: user.name,
			phone: user.phone,
			role: user.role,
			// Mirrors the monolith: every new user gets a default favourite list.
			favourites: { create: { name: "My Favourite List" } },
		};
	}

	public toUpdateInput(user: User): Prisma.UserUpdateInput {
		return {
			name: user.name,
			phone: user.phone,
		};
	}
}
