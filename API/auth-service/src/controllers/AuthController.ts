import { type NextFunction, type Response, type Request } from "express";
import { type SignUpRequest } from "../types/Request.ts";
import AuthService from "../services/AuthService.ts";
import ResponseHelper from "../utils/ResponseHelper.ts";
import type { ApiResponse, SignUpResponse } from "../types/Response.ts";
import IdentityProviderError from "../errors/IdentityProviderError.ts";
import UserService from "../services/UserService.ts";
import { retry } from "../utils/RetryHelper.ts";
import { UsernameExistsException } from "@aws-sdk/client-cognito-identity-provider";

class AuthController {
    private authService = new AuthService();
    private userService = new UserService();

    constructor() {}

    public async signUp(req: SignUpRequest, res: Response<ApiResponse<SignUpResponse>>, next: NextFunction) {
        const { username, password, email } = req.body;

        // Sign up user
        const cognitoResponse = await retry(async () => {
            const resp = await this.authService.signUp(username, password, email);
            if (!resp || !resp.UserSub) {
                throw new IdentityProviderError();
            }
            return resp;
        });
        res.locals["cognitoResponse"] = cognitoResponse;
        res.locals["email"] = email;
        next();
        // return ResponseHelper.success(res, cognitoResponse);
    }

    public async cacheUser(_req: Request, res: Response) {
        const { cognitoResponse, email } = res.locals;
        // Cache user
        await retry(async () => {
            try {
                const success = await this.userService.cacheUser(cognitoResponse.UserSub!, email);
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
        return ResponseHelper.success(res, { UserSub: cognitoResponse.UserSub });
    }
}

export default AuthController;
