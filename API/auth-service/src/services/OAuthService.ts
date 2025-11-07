import axios from "axios";
import JwtService from "./JwtService";
import { GoogleOAuthResponse } from "../types/Axios";

export interface GoogleOAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}

class OAuthService {
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;

    constructor(config: GoogleOAuthConfig) {
        this.clientId = config.clientId;
        this.clientSecret = config.clientSecret;
        this.redirectUri = config.redirectUri;
    }

    public async exchangeUserInfo(code: string): Promise<GoogleOAuthResponse> {
        // Exchange code -> token
        const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
            code,
            client_id: this.clientId,
            client_secret: this.clientSecret,
            redirect_uri: this.redirectUri,
            grant_type: "authorization_code",
        });
        const { id_token } = tokenRes.data;
        const userInfo: GoogleOAuthResponse = JwtService.parseJwt(id_token);
        return userInfo;
    }
}

export default OAuthService;
