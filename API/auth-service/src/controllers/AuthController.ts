import { type NextFunction, type Response, type Request } from "express";
import { type ConfirmUserInfo, type ConfirmUserRequest, type LogInRequest, type SignUpInfo, type SignUpRequest } from "../types/Request";
import AuthService from "../services/AuthService";
import ResponseHelper from "../utils/ResponseHelper";
import type { ApiResponse, ConfirmUserResponse, LogInResponse, SignUpResponse } from "../types/Response";
import IdentityProviderError from "../errors/IdentityProviderError";
import UserService from "../services/UserService";
import { retry } from "../utils/RetryHelper";
import { UsernameExistsException } from "@aws-sdk/client-cognito-identity-provider";
import type { CacheInfo } from "../types/Axios";

class AuthController {
    private authService = new AuthService();
    private userService = new UserService();

    constructor() {}

    public async signUp(req: SignUpRequest, res: Response, next: NextFunction) {
        const { email, password, name, phone }: SignUpInfo = req.body;

        // Sign up user
        const cognitoResponse = await retry(async () => {
            const resp = await this.authService.signUp(email, password);
            if (!resp || !resp.UserSub) {
                throw new IdentityProviderError();
            }
            return resp;
        });
        res.locals["cognitoResponse"] = cognitoResponse;
        res.locals["email"] = email;
        res.locals["name"] = name;
        res.locals["phone"] = phone;
        next();
        // return ResponseHelper.success(res, cognitoResponse);
    }

    public async cacheUser(_req: Request, res: Response<ApiResponse<SignUpResponse>>) {
        const { cognitoResponse, email, name, phone } = res.locals;
        // Cache user
        await retry(async () => {
            try {
                const cacheInfo: CacheInfo = {
                    email,
                    info: {
                        cognitoSub: cognitoResponse.UserSub,
                        name: name,
                        phone: phone,
                    },
                };
                const success = await this.userService.cacheUser(cacheInfo);
                if (!success) {
                    throw new Error("Failed to cache user");
                }
            } catch (error) {
                await this.authService.deleteAccount(email);
                if (error instanceof UsernameExistsException) {
                    throw new Error("User name already exists", error);
                }

                throw new Error(error as string);
            }
        });

        // Return the sub to the client. Client will have to send this UserSub along with the OTP to confirm
        return ResponseHelper.success<SignUpResponse>(res, cognitoResponse);
    }

    public async confirmUser(req: ConfirmUserRequest, res: Response, next: NextFunction) {
        const { email, confirmCode }: ConfirmUserInfo = req.body;

        const response: boolean = await this.authService.confirmSignUp(email, confirmCode);

        if (!response) {
            throw new IdentityProviderError("Invalid OTP Code");
        }

        res.locals["email"] = email;

        next();
    }

    public async saveUser(_req: Request, res: Response<ApiResponse<ConfirmUserResponse>>) {
        const email = res.locals["email"];

        const response = await this.userService.saveUser(email);

        if (!response) {
            throw new Error("Fail to save user to db");
        }

        return ResponseHelper.success<ConfirmUserResponse>(res, { success: true });
    }

    public async logIn(req: LogInRequest, res: Response<ApiResponse<LogInResponse>>) {
        const { username, password } = req.body;

        const awsResponse = await this.authService.logIn(username, password);
        const auth = awsResponse.AuthenticationResult;
        if (
            !auth || //
            !auth.AccessToken ||
            !auth.IdToken ||
            !auth.RefreshToken ||
            !auth.ExpiresIn ||
            !auth.TokenType
        ) {
            throw new Error("Invalid response from auth provider");
        }
        const issuedAt = Date.now(); // ms
        const expiresIn = auth.ExpiresIn; // seconds
        const expiresAt = issuedAt + expiresIn * 1000;

        const response: LogInResponse = {
            accessToken: auth.AccessToken,
            idToken: auth.IdToken,
            refreshToken: auth.RefreshToken,
            expiresAt: expiresAt,
            tokenType: auth.TokenType,
        };

        return ResponseHelper.success<LogInResponse>(res, response);
    }
}

export default AuthController;
