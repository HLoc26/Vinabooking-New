import type { User } from "../../generated/prisma/index.js";
import PrismaSingleton from "../clients/PrismaSingleton.ts";
import { type UserWithFavourites, type SaveUserInfo, EUserRole } from "../types/User.ts";

class UserRepository {
    private prismaClient = PrismaSingleton.getInstance();

    constructor() {}

    public async getUserById(id: string, withFavourites: boolean = false): Promise<UserWithFavourites | User | null> {
        const queryOptions = {
            where: { id },
            include: {},
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

    public async createUser(info: SaveUserInfo) {
        return await this.prismaClient.user.create({
            data: {
                id: info.cognitoSub,
                name: info.name,
                email: info.email,
                phone: info.phone,
                role: EUserRole.TRAVELLER,
            },
        });
    }
}

export default UserRepository;
