import { type Response } from "express";
import { type AuthRequestBody, type TypedRequest } from "../types/Request.ts";
import AuthService from "../services/AuthService.ts";
import ResponseHelper from "../utils/ResponseHelper.ts";

class AuthController {
    private authService = new AuthService();
    constructor() {}

    public async signUp(req: TypedRequest<AuthRequestBody>, res: Response) {
        const { username, password, email } = req.body;

        const response = await this.authService.signUp(username, password, email);

        return ResponseHelper.success(res, response);
    }
}

export default AuthController;
