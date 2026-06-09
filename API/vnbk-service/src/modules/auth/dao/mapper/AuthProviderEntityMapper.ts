import { injectable } from "tsyringe";
import { type UserAuthProvider as PrismaUserAuthProvider, Prisma } from "@/generated/client";
import type { IMapper } from "@/shared/mapper/IMapper";
import { AuthProvider } from "@/modules/auth/domain/AuthProvider";

/** Maps between the Prisma UserAuthProvider entity and the AuthProvider domain model. DAO-only. */
@injectable()
export class AuthProviderEntityMapper implements IMapper<AuthProvider, PrismaUserAuthProvider> {
	public toDomain(entity: PrismaUserAuthProvider): AuthProvider {
		return AuthProvider.rehydrate({
			userId: entity.userId,
			email: entity.email,
			provider: entity.provider,
		});
	}

	public toCreateInput(provider: AuthProvider): Prisma.UserAuthProviderUncheckedCreateInput {
		return {
			userId: provider.userId,
			email: provider.email,
			provider: provider.provider,
		};
	}
}
