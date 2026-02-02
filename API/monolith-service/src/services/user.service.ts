import { User } from "@/generated/client";
import UserRepository from "@/repositories/user.repository";
import { UserWithFavourites } from "@/types/dtos/get-user.dto";
import { UserCacheInfo } from "@/types/dtos/cache-user-info.dto";
import redisClient from "../clients/redis.client";
import { UserCreateWithoutFavouritesInput, UserUpdateInput } from "@/generated/models";

class UserService {
	readonly #userRepository: UserRepository;

	constructor(userRepository: UserRepository) {
		this.#userRepository = userRepository;
	}

	public async getUser<T extends boolean = false>(
		field: { id?: string; email?: string },
		withFavourites: T = false as T // generic
	): Promise<(T extends true ? UserWithFavourites : User) | null> {
		if (!field.id && !field.email) {
			return null;
		}
		let userRaw;

		if (field.id) {
			userRaw = await this.#userRepository.getUserById(field.id, withFavourites);

			// Found User, but Email input != Email in DB -> Mismatch
			if (userRaw && field.email && userRaw.email !== field.email) {
				throw new Error("Mismatch info: ID and Email do not match");
			}
		} else if (field.email) {
			userRaw = await this.#userRepository.getByEmail(field.email, withFavourites);
		}
		if (!userRaw) {
			const criteria = field.id ? `ID ${field.id}` : `email ${field.email}`;
			throw new Error(`User with ${criteria} not found`);
		}
		return userRaw;
	}

	public async getUserById(id: string, withFavourites: boolean = false): Promise<User | UserWithFavourites | null> {
		return this.getUser({ id }, withFavourites);
	}

	public async cacheUser(cacheInfo: UserCacheInfo) {
		try {
			const result: string | null = await redisClient.set(cacheInfo.email, JSON.stringify(cacheInfo.info), {
				expiration: { type: "EX", value: 300 },
			});
			return result === "OK";
		} catch (err) {
			throw new Error(`Failed to save user to cache: ${err}`);
		}
	}

	public async deleteCache(cognitoSub: string): Promise<boolean> {
		try {
			await redisClient.del(cognitoSub);
			return true;
		} catch (err) {
			throw new Error(`Redis error: ${err}`);
		}
	}

	public async saveUserFromCache(email: string): Promise<UserWithFavourites> {
		const infoString: string | null = await redisClient.get(email);

		if (!infoString) {
			throw new Error("User not found in cache");
		}

		const info: UserCreateWithoutFavouritesInput = JSON.parse(infoString);
		info.email = email;

		return await this.#userRepository.createUser(info);
	}

	public async createUser(input: UserCreateWithoutFavouritesInput) {
		return await this.#userRepository.createUser(input);
	}

	public async updateUser(id: string, data: UserUpdateInput) {
		return await this.#userRepository.updateUser(id, data);
	}
}

export default UserService;
