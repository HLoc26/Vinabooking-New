import { inject, injectable } from "tsyringe";
import type { IUserService, PendingUserInfo } from "@/modules/user/service/IUserService";
import { USER_REPOSITORY } from "@/modules/user/user.tokens";
import type { IUserRepository } from "@/modules/user/repository/IUserRepository";
import { CACHE_SERVICE } from "@/infrastructure/infrastructure.tokens";
import type { ICacheService } from "@/infrastructure/cache/ICacheService";
import { User } from "@/modules/user/domain/User";
import type { ERole } from "@/modules/user/enums/ERole";
import type { CreateUserRequest } from "@/modules/user/dto/request/CreateUserRequest";
import type { UpdateUserRequest } from "@/modules/user/dto/request/UpdateUserRequest";
import { NotFoundError } from "@/shared/error/NotFoundError";

const ROLE_CACHE_TTL_SECONDS = 3600;
const PENDING_USER_TTL_SECONDS = 300;

@injectable()
export class UserServiceImpl implements IUserService {
	constructor(
		@inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
		@inject(CACHE_SERVICE) private readonly cache: ICacheService
	) {}

	public async getById(id: string): Promise<User> {
		const user = await this.userRepository.findById(id);
		if (!user) throw new NotFoundError(`User with ID ${id} not found`);
		return user;
	}

	public async findById(id: string): Promise<User | null> {
		return this.userRepository.findById(id);
	}

	public async getByEmail(email: string): Promise<User> {
		const user = await this.userRepository.findByEmail(email);
		if (!user) throw new NotFoundError(`User with email ${email} not found`);
		return user;
	}

	public async getRole(id: string): Promise<ERole> {
		const cacheKey = `user:${id}:role`;
		const cached = await this.safeCacheGet(cacheKey);
		if (cached) return cached as ERole;

		const role = await this.userRepository.findRoleById(id);
		if (!role) throw new NotFoundError(`User with ID ${id} not found`);
		await this.safeCacheSet(cacheKey, role, ROLE_CACHE_TTL_SECONDS);
		return role;
	}

	public async create(request: CreateUserRequest): Promise<User> {
		const user = User.create({
			id: request.cognitoSub,
			email: request.email,
			name: request.name,
			phone: request.phone ?? null,
			role: request.role,
		});
		return this.userRepository.create(user);
	}

	public async update(id: string, request: UpdateUserRequest): Promise<User> {
		const user = await this.getById(id);
		user.updateProfile(request.name, request.phone);
		const updated = await this.userRepository.update(user);
		await this.safeCacheDel(`user:${id}:role`);
		return updated;
	}

	public async cachePendingUser(info: PendingUserInfo): Promise<void> {
		await this.cache.set(info.email, JSON.stringify(info), PENDING_USER_TTL_SECONDS);
	}

	public async savePendingUser(email: string): Promise<User> {
		const raw = await this.cache.get(email);
		if (!raw) throw new NotFoundError("User not found in cache");
		const info = JSON.parse(raw) as PendingUserInfo;
		const user = User.create({
			id: info.id,
			email,
			name: info.name,
			phone: info.phone,
			role: info.role,
		});
		return this.userRepository.create(user);
	}

	public async deletePendingUser(key: string): Promise<void> {
		await this.cache.del(key);
	}

	// --- best-effort cache helpers (a cache outage must not fail the request) ---

	private async safeCacheGet(key: string): Promise<string | null> {
		try {
			return await this.cache.get(key);
		} catch (err) {
			console.error(`[cache] get ${key} failed`, err);
			return null;
		}
	}

	private async safeCacheSet(key: string, value: string, ttl: number): Promise<void> {
		try {
			await this.cache.set(key, value, ttl);
		} catch (err) {
			console.error(`[cache] set ${key} failed`, err);
		}
	}

	private async safeCacheDel(key: string): Promise<void> {
		try {
			await this.cache.del(key);
		} catch (err) {
			console.error(`[cache] del ${key} failed`, err);
		}
	}
}
