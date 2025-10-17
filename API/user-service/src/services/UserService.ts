import type { User as UserSchema } from "../../generated/prisma/index.js";
import User from "../classes/User";
import { getRedisClient } from "../clients/RedisSingleton";
import DatabaseError from "../errors/DatabaseError";
import NotFoundError from "../errors/NotFoundError";
import RedisClientError from "../errors/RedisClientError";
import UserRepository from "../repositories/UserRepository";
import type { CacheInfo } from "../types/Request";
import type { SaveUserInfo, UserWithFavourites } from "../types/User";

class UserService {
    private userRepository = new UserRepository();

    public async getUserById(id: string, withFavourites: boolean = false): Promise<User | null> {
        const result: UserWithFavourites | UserSchema | null = await this.userRepository.getUserById(id, withFavourites);
        if (!result) return null;

        return User.fromSchema(result);
    }

    public async cacheUser(cacheInfo: CacheInfo): Promise<boolean> {
        try {
            const redisClient = await getRedisClient();
            const result: string | null = await redisClient.set(cacheInfo.email, JSON.stringify(cacheInfo.info), {
                expiration: { type: "EX", value: 300 },
            });
            return result === "OK";
        } catch (err) {
            throw new RedisClientError(`Failed to save user to cache: ${err}`);
        }
    }

    public async deleteCache(cognitoSub: string): Promise<boolean> {
        try {
            const redisClient = await getRedisClient();
            const result = await redisClient.del(cognitoSub);
            if (!result) throw new RedisClientError(`Failed to delete user ${cognitoSub}`);
            return true;
        } catch (err) {
            throw new RedisClientError(`Redis error: ${err}`);
        }
    }

    public async saveUser(email: string): Promise<UserSchema> {
        const redisClient = await getRedisClient();
        const infoString: string | null = await redisClient.get(email);

        if (!infoString) {
            throw new NotFoundError("User not found in cache");
        }

        const info: SaveUserInfo = JSON.parse(infoString);
        info.email = email;

        const result = await this.userRepository.createUser(info);

        if (!result || !result.id || !result.name || !result.email) {
            throw new DatabaseError(`Fail to create user ${info.email}`);
        }

        return result;
    }
}

export default UserService;
