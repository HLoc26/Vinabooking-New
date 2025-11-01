import { type EProvider } from "../../generated/prisma/client";
import PrismaSingleton from "../clients/PrismaSingleton";

class AuthRepository {
    private prismaClient = PrismaSingleton.getInstance();
    constructor() {}

    public async createUserProvider(username: string, provider: EProvider) {
        return await this.prismaClient.userAuthProvider.create({ data: { email: username, provider: provider } });
    }

    public async getUserProvider(username: string) {
        return await this.prismaClient.userAuthProvider.findFirstOrThrow({ where: { email: username } });
    }
}

export default AuthRepository;
