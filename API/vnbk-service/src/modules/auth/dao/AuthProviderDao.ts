import { injectable } from "tsyringe";
import { PrismaProvider } from "@/infrastructure/persistence/PrismaProvider";
import { BaseDao } from "@/infrastructure/persistence/BaseDao";
import type { IAuthProviderRepository } from "@/modules/auth/repository/IAuthProviderRepository";
import type { AuthProvider } from "@/modules/auth/domain/AuthProvider";
import { AuthProviderEntityMapper } from "@/modules/auth/dao/mapper/AuthProviderEntityMapper";

/** Prisma-backed implementation of IAuthProviderRepository. The only place UserAuthProvider touches Prisma. */
@injectable()
export class AuthProviderDao extends BaseDao implements IAuthProviderRepository {
	constructor(
		private readonly prisma: PrismaProvider,
		private readonly mapper: AuthProviderEntityMapper
	) {
		super();
	}

	public async create(provider: AuthProvider): Promise<AuthProvider> {
		return this.run(async () => {
			const entity = await this.prisma.client.userAuthProvider.create({
				data: this.mapper.toCreateInput(provider),
			});
			return this.mapper.toDomain(entity);
		});
	}

	public async findByEmail(email: string): Promise<AuthProvider[]> {
		return this.run(async () => {
			const entities = await this.prisma.client.userAuthProvider.findMany({ where: { email } });
			return entities.map((entity) => this.mapper.toDomain(entity));
		});
	}
}
