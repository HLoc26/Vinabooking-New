import type { User as UserSchema } from "../../generated/prisma/index.js";
import User from "../classes/User";
import { getRedisClient } from "../clients/RedisSingleton";
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";
import NotFoundError from "../errors/NotFoundError";
import RedisClientError from "../errors/RedisClientError";
import UserRepository from "../repositories/UserRepository";
import type { CacheInfo } from "../types/Request";
import type { SaveUserInfo, UserWithFavourites } from "../types/User";

class UserService {
	private userRepository = new UserRepository();

	public async getUser(field: { id?: string; email?: string }, withFavourites: boolean = false): Promise<User | null> {
		const result = {
			email: field.email ? await this.userRepository.getUserByEmail(field.email, withFavourites) : null,
			id: field.id ? await this.userRepository.getUserById(field.id, withFavourites) : null,
		};

		// If specify both fields, they have to belongs to the same user
		if (field.id && field.email) {
			if (!result.id || !result.email || result.id.id !== result.email.id) {
				throw new BadRequestError("Mismatch info: ID and Email do not match");
			}
			return User.fromSchema(result.id);
		}

		// If only id
		if (field.id) {
			if (!result.id) throw new NotFoundError(`User with ID ${field.id} not found`);
			return User.fromSchema(result.id);
		}

		// If only email
		if (field.email) {
			if (!result.email) throw new NotFoundError(`User with email ${field.email} not found`);
			return User.fromSchema(result.email);
		}

		return null;
	}

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

	public async saveUserFromCache(email: string): Promise<UserSchema> {
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

	public async saveUser(id: string, email: string, name: string) {
		const info: SaveUserInfo = {
			cognitoSub: id,
			email: email,
			phone: null,
			name: name,
			userType: "TRAVELLER",
		};
		const result = await this.userRepository.createUser(info);

		if (!result || !result.id || !result.name || !result.email) {
			throw new DatabaseError(`Fail to create user ${info.email}`);
		}

		return result;
	}
}

export default UserService;
