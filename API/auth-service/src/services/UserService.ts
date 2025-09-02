import type { AxiosInstance, AxiosResponse } from "axios";
import type { CacheUserRequest, CacheUserResponse } from "../types/Axios.ts";
import { UserAxiosClient } from "../clients/UserServiceClient.ts";

class UserService {
    private axiosInstance: AxiosInstance = UserAxiosClient.getInstance();

    constructor() {}

    public async cacheUser(cognitoSub: string, email: string) {
        const cacheResponse = await this.axiosInstance.post<CacheUserResponse, AxiosResponse<CacheUserResponse, CacheUserRequest>, CacheUserRequest>(
            "/save-cache",
            {
                cognitoSub,
                email,
            }
        );

        if (!cacheResponse.data) throw new Error("Failed to cache user");
        return cacheResponse;
    }
}

export default UserService;
