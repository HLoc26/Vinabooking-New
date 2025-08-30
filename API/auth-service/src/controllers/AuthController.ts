import { type Response } from "express";
import { type SignUpRequest } from "../types/Request.ts";
import AuthService from "../services/AuthService.ts";
import ResponseHelper from "../utils/ResponseHelper.ts";
import type { ApiResponse, SignUpResponse } from "../types/Response.ts";
import IdentityProviderError from "../errors/IdentityProviderError.ts";

class AuthController {
    private authService = new AuthService();
    constructor() {}

    public async signUp(req: SignUpRequest, res: Response<ApiResponse<SignUpResponse>>) {
        const { username, password, email } = req.body;

        const response = await this.authService.signUp(username, password, email);

        if (!response) throw new IdentityProviderError();

        return ResponseHelper.success(res, response);
    }
}

export default AuthController;
