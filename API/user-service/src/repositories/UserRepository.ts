import type { User } from "../../generated/prisma/index.js";
import PrismaSingleton from "../clients/PrismaSingleton";
import { type UserWithFavourites, type SaveUserInfo, EUserRole } from "../types/User";
import FavouriteRepository from "./FavouriteRepository";

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
        return await this.prismaClient.$transaction(async (tx) => {
            const user = tx.user.create({
                data: {
                    id: info.cognitoSub,
                    name: info.name,
                    email: info.email,
                    phone: info.phone,
                    role: EUserRole.TRAVELLER,
                },
            });

            const favouriteRepository = new FavouriteRepository();
            await favouriteRepository.createDefaultList(info.cognitoSub, tx);
            return user;
        });
    }
}

export default UserRepository;
