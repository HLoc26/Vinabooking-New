import UserRepository from "@/repositories/user.repository";
import FavouriteService from "./favourite.service";
import redisClient from "../clients/redis.client";
import { UserCreateDto, UserUpdateDto, UserCacheInfo } from "@/dto/request/user.dto";
import { UserDto, UserWithFavouritesDto } from "@/dto/response/user.dto";
import { User } from "@/models/user";
import BadRequestError from "@/errors/BadRequestError";
import NotFoundError from "@/errors/NotFoundError";
import DatabaseError from "@/errors/DatabaseError";
import RedisClientError from "@/errors/RedisClientError";

class UserService {
	readonly #userRepository: UserRepository;
	readonly #favouriteService: FavouriteService;

	constructor(userRepository: UserRepository, favouriteService: FavouriteService) {
		this.#userRepository = userRepository;
		this.#favouriteService = favouriteService;
	}

	public async getUser<T extends boolean = false>(
		field: { id?: string; email?: string },
		withFavourites: T = false as T
	): Promise<(T extends true ? UserWithFavouritesDto : UserDto) | null> {
		if (!field.id && !field.email) {
			return null;
		}
		let userDomain: User | null = null;

		if (field.id) {
			userDomain = await this.#userRepository.getUserById(field.id);

			// Found User, but Email input != Email in DB -> Mismatch
			if (userDomain && field.email && userDomain.getEmail() !== field.email) {
				throw new BadRequestError("Mismatch info: ID and Email do not match");
			}
		} else if (field.email) {
			userDomain = await this.#userRepository.getByEmail(field.email);
		}

		if (!userDomain) {
			const criteria = field.id ? `ID ${field.id}` : `email ${field.email}`;
			throw new NotFoundError(`User with ${criteria} not found`);
		}

		const baseDto: UserDto = {
			id: userDomain.getId(),
			email: userDomain.getEmail(),
			name: userDomain.getName(),
			phone: userDomain.getPhone(),
			role: userDomain.getRole(),
			createdAt: userDomain.getCreatedAt(),
			updatedAt: userDomain.getUpdatedAt()
		};

		if (withFavourites) {
			// Orchestrate: Fetch favourites from the foreign domain service
			const lists = await this.#favouriteService.getListsByOwnerId(userDomain.getId());
			
			const withFavsDto: UserWithFavouritesDto = {
				...baseDto,
				favourites: lists,
			};
			return withFavsDto as (T extends true ? UserWithFavouritesDto : UserDto);
		}

		return baseDto as (T extends true ? UserWithFavouritesDto : UserDto);
	}

	public async getUserById(id: string, withFavourites: boolean = false): Promise<UserDto | UserWithFavouritesDto | null> {
		return this.getUser({ id }, withFavourites);
	}

	public async cacheUser(cacheInfo: UserCacheInfo) {
		try {
			const result: string | null = await redisClient.set(cacheInfo.email, JSON.stringify(cacheInfo.info), {
				expiration: { type: "EX", value: 300 },
			});
			return result === "OK";
		} catch (err) {
			throw new DatabaseError(`Failed to save user to cache: ${err}`);
		}
	}

	public async deleteCache(cognitoSub: string): Promise<boolean> {
		try {
			await redisClient.del(cognitoSub);
			return true;
		} catch (err) {
			throw new RedisClientError(`Redis error: ${err}`);
		}
	}

	public async saveUserFromCache(email: string): Promise<UserWithFavouritesDto> {
		const infoString: string | null = await redisClient.get(email);

		if (!infoString) {
			throw new NotFoundError("User not found in cache");
		}

		const info: UserCreateDto = JSON.parse(infoString);
		info.email = email;

		return await this.createUser(info);
	}

	public async createUser(input: UserCreateDto): Promise<UserWithFavouritesDto> {
		// 1. Core Entity Creation
		const userDomain = await this.#userRepository.createUser(input);

		// 2. Cross-Domain Orchestration: Create default favourite list
		await this.#favouriteService.createList("My Favourite List", userDomain.getId());

		// 3. Re-fetch via orchestration to get full DTO
		const fullUser = await this.getUserById(userDomain.getId(), true);
		return fullUser as UserWithFavouritesDto;
	}

	public async updateUser(id: string, data: UserUpdateDto): Promise<UserDto> {
		const userDomain = await this.#userRepository.updateUser(id, data);
		return {
			id: userDomain.getId(),
			email: userDomain.getEmail(),
			name: userDomain.getName(),
			phone: userDomain.getPhone(),
			role: userDomain.getRole(),
			createdAt: userDomain.getCreatedAt(),
			updatedAt: userDomain.getUpdatedAt()
		};
	}
}

export default UserService;
