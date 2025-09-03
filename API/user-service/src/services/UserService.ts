import type { User as UserSchema } from "../../generated/prisma/index.js";
import User from "../classes/User.ts";
import redisClient from "../clients/RedisSingleton.ts";
import RedisClientError from "../errors/RedisClientError.ts";
import UserRepository from "../repositories/UserRepository.ts";
import type { UserWithFavourites } from "../types/User.ts";

class UserService {
    private userRepository = new UserRepository();

    public async getUserById(id: string, withFavourites: boolean = false): Promise<User | null> {
        const result: UserWithFavourites | UserSchema | null = await this.userRepository.getUserById(id, withFavourites);
        if (!result) {
            return result;
        }
        const user = User.fromSchema(result);

        return user;
    }

    public async cacheUser(cognitoSub: string, email: string): Promise<boolean> {
        const result: string | null = await redisClient.set(cognitoSub, email);

        if (!result) {
            throw new RedisClientError("Failed to save user to cache");
        }
        return true;
    }

    public async deleteCache(cognitoSub: string): Promise<boolean> {
        const result = await redisClient.del(cognitoSub);
        if (!result) {
            throw new RedisClientError(`Failed to delete user ${cognitoSub}`);
        }
        return true;
    }
}

export default UserService;
