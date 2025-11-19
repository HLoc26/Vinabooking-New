import type { AxiosInstance, AxiosResponse } from "axios";
import type { CacheInfo, CacheUserResponse } from "../types/Axios";
import NotFoundError from "../errors/NotFoundError";
import { AxiosError } from "axios";

class UserService {
	constructor(private axiosInstance: AxiosInstance) {}

	public async cacheUser(cacheInfo: CacheInfo) {
		const cacheResponse = await this.axiosInstance.post<
			CacheUserResponse, //
			AxiosResponse<CacheUserResponse, CacheInfo>,
			CacheInfo
		>("/cache", {
			email: cacheInfo.email,
			info: cacheInfo.info,
		});

		if (!cacheResponse.data) throw new Error("Failed to cache user");
		return cacheResponse;
	}

	public async saveUserDirect(cognitoSub: string, email: string, name: string) {
		try {
			const saveResponse = await this.axiosInstance.post("/", { cognitoSub, email, name });

			if (!saveResponse.data) throw new Error("Failed to save user");
			return saveResponse.data;
		} catch (error) {
			throw new Error(`Error when saving user to database: ${error}`);
		}
	}

	public async saveUserFromCache(email: string) {
		try {
			const saveResponse = await this.axiosInstance.post("/db", { email });

			if (!saveResponse.data) throw new Error("Failed to save user");
			return saveResponse.data;
		} catch (error) {
			throw new Error(`Error when saving user to database: ${error}`);
		}
	}

	public async getUser(field: { id?: string; email?: string }) {
		try {
			const params = new URLSearchParams();

			if (field.id) params.append("id", field.id);
			if (field.email) params.append("email", field.email);

			const userResponse = await this.axiosInstance.get(`/?${params.toString()}`);

			const data = userResponse.data?.data;
			if (!data) throw new NotFoundError("User not found: " + (userResponse.data?.error ?? "unknown"));

			return data;
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				if (error.response?.status === 404) {
					return null;
				}
			}

			const e = error as Error;
			throw new Error(`Error when getting user id=${field.id ?? "?"}, email=${field.email ?? "?"}: ${e.message}`);
		}
	}

	public async getUserById(id: string) {
		try {
			const userResponse = await this.axiosInstance.get(`/${id}`);
			if (!userResponse.data.data) throw new NotFoundError("User not found: " + userResponse.data.error);
			return userResponse.data.data;
		} catch (error: unknown) {
			if (error instanceof AxiosError && error.response?.status === 404) {
				throw new NotFoundError(`User not found (id=${id})`);
			}
			const e = error as Error;
			throw new Error(`Error when getting user id ${id}: ${e.message || error}`);
		}
	}
}

export default UserService;
