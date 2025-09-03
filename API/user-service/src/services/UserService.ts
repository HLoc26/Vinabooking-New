import type { User as UserSchema } from "../../generated/prisma/index.js";
import User from "../classes/User.ts";
import redisClient from "../clients/RedisSingleton.ts";
import RedisClientError from "../errors/RedisClientError.ts";
import UserRepository from "../repositories/UserRepository.ts";
import type { CacheInfo } from "../types/Request.ts";
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

    public async cacheUser(cacheInfo: CacheInfo): Promise<boolean> {
        try {
            const result: string | null = await redisClient.set(
                cacheInfo.email, // key
                JSON.stringify(cacheInfo.info), //value
                { expiration: { type: "EX", value: 300 } } // expire after 5min
            );
            return result === "OK";
        } catch (err) {
            throw new RedisClientError(`Failed to save user to cache ${err}`);
        }
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
