import type { AxiosInstance, AxiosResponse } from "axios";
import type { CacheInfo, CacheUserResponse } from "../types/Axios";
import { UserAxiosClient } from "../clients/UserServiceClient";
import NotFoundError from "../errors/NotFoundError";

class UserService {
    private axiosInstance: AxiosInstance = UserAxiosClient.getInstance();

    constructor() {}

    public async cacheUser(cacheInfo: CacheInfo) {
        const cacheResponse = await this.axiosInstance.post<CacheUserResponse, AxiosResponse<CacheUserResponse, CacheInfo>, CacheInfo>(
            "/save-cache",
            {
                email: cacheInfo.email,
                info: cacheInfo.info,
            }
        );

        if (!cacheResponse.data) throw new Error("Failed to cache user");
        return cacheResponse;
    }

    public async saveUser(email: string) {
        try {
            const saveResponse = await this.axiosInstance.post("/save-db", { email });

            if (!saveResponse.data) throw new Error("Failed to save user");
            return saveResponse.data;
        } catch (error) {
            throw new Error(`Error when saving user to database: ${error}`);
        }
    }

    public async getUser(id: string) {
        try {
            const userResponse = await this.axiosInstance.get(`/${id}`);
            if (!userResponse.data.data) throw new NotFoundError("User not found" + userResponse.data.error);
            console.log(userResponse);
            return userResponse.data.data;
        } catch (error) {
            throw new Error(`Error when getting user id ${id}: ${error}`);
        }
    }
}

export default UserService;
