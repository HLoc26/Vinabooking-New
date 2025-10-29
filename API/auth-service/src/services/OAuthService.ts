import axios from "axios";
import EnvironmentNotSetError from "../errors/EnvironmentNotSetError";
import JwtService from "./JwtService";
import { GoogleOAuthResponse } from "../types/Axios";

class OAuthService {
    private GOOGLE_CLIENT_ID;
    private GOOGLE_CLIENT_SECRET;
    private REDIRECT_URI;

    constructor() {
        if (!process.env["GOOGLE_CLIENT_ID"]) {
            throw new EnvironmentNotSetError("Missing GOOGLE_CLIENT_ID");
        }
        if (!process.env["GOOGLE_CLIENT_SECRET"]) {
            throw new EnvironmentNotSetError("Missing GOOGLE_CLIENT_SECRET");
        }

        this.GOOGLE_CLIENT_ID = process.env["GOOGLE_CLIENT_ID"];
        this.GOOGLE_CLIENT_SECRET = process.env["GOOGLE_CLIENT_SECRET"];
        this.REDIRECT_URI = "http://localhost:3000/auth/google/callback";
    }

    public async exchangeUserInfo(code: string): Promise<GoogleOAuthResponse> {
        // Exchange code -> token
        const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
            code,
            client_id: this.GOOGLE_CLIENT_ID,
            client_secret: this.GOOGLE_CLIENT_SECRET,
            redirect_uri: this.REDIRECT_URI,
            grant_type: "authorization_code",
        });
        const { id_token } = tokenRes.data;
        const userInfo: GoogleOAuthResponse = JwtService.parseJwt(id_token);
        return userInfo;
    }
}

export default OAuthService;
