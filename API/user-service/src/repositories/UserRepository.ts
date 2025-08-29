import type { User } from "../../generated/prisma/index.js";
import PrismaSingleton from "../clients/PrismaSingleton.ts";
import type { UserWithFavourites } from "../types/User.ts";

class UserRepository {
    private prismaClient = PrismaSingleton.getInstance();

    constructor() {}

    public async getUserById(id: string, withFavourites: boolean = false): Promise<UserWithFavourites | User | null> {
        const queryOptions: any = {
            where: { id },
        };

        if (withFavourites) {
            queryOptions.include = {
                favourites: {
                    include: {
                        items: true,
                    },
                },
            };
        }

        return await this.prismaClient.user.findUnique(queryOptions);
    }
}

export default UserRepository;
