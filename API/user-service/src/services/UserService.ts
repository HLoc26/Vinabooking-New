import type { User as UserSchema } from "../../generated/prisma/index.js";
import User from "../classes/User";
import redisClient from "../clients/RedisSingleton";
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

    public async saveUser(email: string): Promise<UserSchema> {
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
