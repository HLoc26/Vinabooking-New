import axios from "axios";
import { UserPayload } from "../types/Request";
class AuthServiceClient {
    private readonly axiosInstance;
    constructor() {
        const authServiceUrl = process.env["AUTH_ENDPOINT"];

        if (!authServiceUrl) {
            throw new Error("Env not set: AUTH_ENDPOINT");
        }

        this.axiosInstance = axios.create({ baseURL: authServiceUrl });
    }

    public async verify(token: string): Promise<UserPayload> {
        const response = await this.axiosInstance.post("/verify", {
            token: token,
            tokenType: "ACCESS",
        });

        if (!response.data.data || response.data.error) {
            throw new Error(response.data.error);
        }

        return response.data.data.user;
    }
}

export default AuthServiceClient;
