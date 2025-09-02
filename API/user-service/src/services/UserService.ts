import type { User as UserSchema } from "../../generated/prisma/index.js";
import User from "../classes/User.ts";
import RedisClient from "../clients/RedisSingleton.ts";
import RedisClientError from "../errors/RedisClientError.ts";
import UserRepository from "../repositories/UserRepository.ts";
import type { UserWithFavourites } from "../types/User.ts";

class UserService {
    private userRepository = new UserRepository();
    private redisClient = RedisClient.getInstance();

    public async getUserById(id: string, withFavourites: boolean = false): Promise<User | null> {
        const result: UserWithFavourites | UserSchema | null = await this.userRepository.getUserById(id, withFavourites);
        if (!result) {
            return result;
        }
        const user = User.fromSchema(result);

        return user;
    }

    public async cacheUser(cognitoSub: string, email: string): Promise<boolean> {
        this.redisClient.connect();
        const result: string | null = await this.redisClient.set(cognitoSub, email);

        if (!result) {
            throw new RedisClientError("Failed to save user to cache");
        }
        this.redisClient.close();
        return true;
    }

    public async deleteCache(cognitoSub: string): Promise<boolean> {
        this.redisClient.connect();
        const result = await this.redisClient.del(cognitoSub);
        if (!result) {
            throw new RedisClientError(`Failed to delete user ${cognitoSub}`);
        }
        this.redisClient.close();
        return true;
    }
}

export default UserService;
