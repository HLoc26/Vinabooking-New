import { PrismaClient } from "@prisma/client";
import { type EProvider } from "../../generated/prisma/client";

class AuthRepository {
    constructor(private prismaClient: PrismaClient) {}

    public async createUserProvider(username: string, provider: EProvider) {
        return await this.prismaClient.userAuthProvider.create({ data: { email: username, provider: provider } });
    }

    public async getUserProvider(username: string) {
        return await this.prismaClient.userAuthProvider.findFirstOrThrow({ where: { email: username } });
    }
}

export default AuthRepository;
