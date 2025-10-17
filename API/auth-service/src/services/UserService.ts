import type { AxiosInstance, AxiosResponse } from "axios";
import type { CacheInfo, CacheUserResponse } from "../types/Axios.ts";
import { UserAxiosClient } from "../clients/UserServiceClient.ts";

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
}

export default UserService;
