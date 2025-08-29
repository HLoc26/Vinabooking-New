import type { User as UserSchema } from "../../generated/prisma/index.js";
import User from "../classes/User.ts";
import UserRepository from "../repositories/UserRepository.ts";
import type { UserWithFavourites } from "../types/User.ts";

class UserService {
    private userRepository = new UserRepository();

    public async getUserById(id: string, withFavourites: boolean = false): Promise<User | null> {
        console.log("in service", withFavourites);
        const result: UserWithFavourites | UserSchema | null = await this.userRepository.getUserById(id, withFavourites);
        if (!result) {
            return result;
        }
        console.log(result);
        const user = User.fromSchema(result);

        return user;
    }
}

export default UserService;
