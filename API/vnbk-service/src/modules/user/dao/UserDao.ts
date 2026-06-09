import { injectable } from "tsyringe";
import { PrismaProvider } from "@/infrastructure/persistence/PrismaProvider";
import { BaseDao } from "@/infrastructure/persistence/BaseDao";
import type { IUserRepository } from "@/modules/user/repository/IUserRepository";
import type { User } from "@/modules/user/domain/User";
import type { ERole } from "@/modules/user/enums/ERole";
import { UserEntityMapper } from "@/modules/user/dao/mapper/UserEntityMapper";

/** Prisma-backed implementation of IUserRepository. The only place User touches Prisma. */
@injectable()
export class UserDao extends BaseDao implements IUserRepository {
	constructor(
		private readonly prisma: PrismaProvider,
		private readonly mapper: UserEntityMapper
	) {
		super();
	}

	public async findById(id: string): Promise<User | null> {
		return this.run(async () => {
			const entity = await this.prisma.client.user.findUnique({ where: { id } });
			return entity ? this.mapper.toDomain(entity) : null;
		});
	}

	public async findByEmail(email: string): Promise<User | null> {
		return this.run(async () => {
			const entity = await this.prisma.client.user.findUnique({ where: { email } });
			return entity ? this.mapper.toDomain(entity) : null;
		});
	}

	public async create(user: User): Promise<User> {
		return this.run(async () => {
			const entity = await this.prisma.client.user.create({ data: this.mapper.toCreateInput(user) });
			return this.mapper.toDomain(entity);
		});
	}

	public async update(user: User): Promise<User> {
		return this.run(async () => {
			const entity = await this.prisma.client.user.update({
				where: { id: user.id },
				data: this.mapper.toUpdateInput(user),
			});
			return this.mapper.toDomain(entity);
		});
	}

	public async findRoleById(id: string): Promise<ERole | null> {
		return this.run(async () => {
			const row = await this.prisma.client.user.findUnique({
				where: { id },
				select: { role: true },
			});
			return row ? row.role : null;
		});
	}
}
