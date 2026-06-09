import { PrismaClient, Prisma } from "@/generated/client";
import { UserCreateDto, UserUpdateDto } from "@/dto/request/user.dto";
import { User } from "@/models/user";
import { UserMapper } from "@/mappers/user.mapper";

class UserRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	// Overloading cases
	public async getByEmail(email: string): Promise<User | null> {
		return this.#findOne({ email });
	}

	public async getUserById(id: string): Promise<User | null> {
		return this.#findOne({ id });
	}

	async #findOne(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
		const prismaUser = await this.#prismaClient.user.findUnique({ where });
		if (!prismaUser) return null;
		return UserMapper.toDomain(prismaUser);
	}

	public async createUser(input: UserCreateDto): Promise<User> {
		const prismaUser = await this.#prismaClient.user.create({
			data: {
				id: input.id,
				email: input.email,
				name: input.name,
				phone: input.phone || null,
			},
		});

		return UserMapper.toDomain(prismaUser);
	}

	public async updateUser(id: string, data: UserUpdateDto): Promise<User> {
		const prismaUser = await this.#prismaClient.user.update({
			where: { id },
			data: {
				name: data.name,
				phone: data.phone,
			},
		});
		return UserMapper.toDomain(prismaUser);
	}

	public async getRoleById(id: string): Promise<{ role: string } | null> {
		return this.#prismaClient.user.findUnique({
			where: { id },
			select: { role: true },
		});
	}
}

export default UserRepository;
