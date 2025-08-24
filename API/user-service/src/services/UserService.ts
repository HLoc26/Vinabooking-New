import type { User } from "../../generated/prisma/index.js";
import PrismaSingleton from "../clients/PrismaSingleton.ts";

class UserService {
    private prismaClient = PrismaSingleton.getInstance();

    public async getUserById(id: string): Promise<User | null> {
        return await this.prismaClient.user.findUnique({ where: { id } });
    }
}

export default UserService;
