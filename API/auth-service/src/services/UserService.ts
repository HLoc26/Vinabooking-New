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
}

export default UserService;
