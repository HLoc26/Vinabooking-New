import { PrismaClient } from "@/generated/client";
import { UserAuthProvider } from "@/models/auth";
import { AuthMapper } from "@/mappers/auth.mapper";

class AuthRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	public async saveUserProvider(userAuthProvider: UserAuthProvider): Promise<UserAuthProvider> {
		const data = AuthMapper.toPersistence(userAuthProvider);
		const saved = await this.#prismaClient.userAuthProvider.create({ data });
		return AuthMapper.toDomain(saved);
	}

	public async getUserProviders(email: string): Promise<UserAuthProvider[]> {
		const providers = await this.#prismaClient.userAuthProvider.findMany({ where: { email } });
		return providers.map(p => AuthMapper.toDomain(p));
	}
}

export default AuthRepository;
