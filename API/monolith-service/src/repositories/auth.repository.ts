import { PrismaClient, type EProvider, UserAuthProvider } from "@generated/client";

class AuthRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	public async createUserProvider(userId: string, email: string, provider: EProvider): Promise<UserAuthProvider> {
		return await this.#prismaClient.userAuthProvider.create({ data: { userId: userId, email: email, provider: provider } });
	}

	public async getUserProviders(email: string): Promise<UserAuthProvider[] | null> {
		return await this.#prismaClient.userAuthProvider.findMany({ where: { email: email } });
	}
}

export default AuthRepository;
