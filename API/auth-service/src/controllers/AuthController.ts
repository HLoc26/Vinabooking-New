import { type NextFunction, type Response, type Request } from "express";
import {
	ConfirmForgotPasswordRequest,
	ETokenType,
	ForgotPasswordRequest,
	GetOTPRequest,
	RefreshRequest,
	VerifyRequest,
	type ConfirmUserInfo,
	type ConfirmUserRequest,
	type LogInRequest,
	type SignUpInfo,
	type SignUpRequest,
} from "../types/Request";
import AuthService from "../services/AuthService";
import ResponseHelper from "../utils/ResponseHelper";
import type {
	ApiResponse,
	ConfirmForgotPasswordResponse,
	ConfirmUserResponse,
	ForgotPasswordResponse,
	GetOTPResponse,
	LogInResponse,
	RefreshResponse,
	SignUpResponse,
	VerifyResponse,
} from "../types/Response";
import IdentityProviderError from "../errors/IdentityProviderError";
import UserService from "../services/UserService";
import { retry } from "../utils/RetryHelper";
import { UsernameExistsException } from "@aws-sdk/client-cognito-identity-provider";
import type { CacheInfo, GoogleOAuthResponse } from "../types/Axios";
import JwtService from "../services/JwtService";
import BadRequestError from "../errors/BadRequestError";
import MappingUtil from "../utils/MappingUtil";
import OAuthService from "../services/OAuthService";
import { EProvider } from "../../generated/prisma/enums";
import AuthRepository from "../repositories/AuthRespository";

class AuthController {
	constructor(
		private authService: AuthService,
		private userService: UserService,
		private oauthService: OAuthService,
		private authRepository: AuthRepository
	) {}

	public async signUp(req: SignUpRequest, res: Response, next: NextFunction) {
		const { email, password, name, phone, userType }: SignUpInfo = req.body;

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
		res.locals["userType"] = userType;
		next();
		// return ResponseHelper.success(res, cognitoResponse);
	}

	public async cacheUser(_req: Request, res: Response<ApiResponse<SignUpResponse>>) {
		const { cognitoResponse, email, name, phone, userType } = res.locals;
		// Cache user
		try {
			const cacheInfo: CacheInfo = {
				email,
				info: {
					cognitoSub: cognitoResponse.UserSub,
					name: name,
					phone: phone,
					userType: userType,
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

		// Return the sub to the client. Client will have to send this UserSub along with the OTP to confirm
		return ResponseHelper.success<SignUpResponse>(res, cognitoResponse);
	}

	public async confirmUser(req: ConfirmUserRequest, res: Response, next: NextFunction) {
		const { username: email, confirmCode }: ConfirmUserInfo = req.body;

		const response: boolean = await this.authService.confirmSignUp(email, confirmCode);

		if (!response) {
			throw new IdentityProviderError("Invalid OTP Code");
		}

		await this.authRepository.createUserProvider(email, EProvider.Credentials);

		res.locals["email"] = email;

		next();
	}

	public async saveUser(_req: Request, res: Response<ApiResponse<ConfirmUserResponse>>) {
		const email = res.locals["email"];

		const response = await this.userService.saveUserFromCache(email);

		if (!response) {
			throw new Error("Fail to save user to db");
		}

		return ResponseHelper.success<ConfirmUserResponse>(res, { success: true });
	}

	public async logIn(req: LogInRequest, res: Response<ApiResponse<LogInResponse>>) {
		const { username, password } = req.body;

		const userAuthProvider = (await this.authRepository.getUserProvider(username)).provider;

		if (userAuthProvider === EProvider.Google) {
			throw new Error("This account was registered using Google, please try login again with your Google Account");
		}

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

		const userFromCognito = await JwtService.verifyIdToken(auth.IdToken);
		const userId = userFromCognito.sub;
		const userInDb = await this.userService.getUserById(userId);

		const response: LogInResponse = {
			accessToken: auth.AccessToken,
			idToken: auth.IdToken,
			expiresIn: auth.ExpiresIn,
			tokenType: auth.TokenType,
			user: {
				id: userId,
				name: userInDb.name,
				phone: userInDb.phone,
				email: username, // user will use their email to login -> email = username
			},
		};
		res.cookie("refresh_token", auth.RefreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		return ResponseHelper.success<LogInResponse>(res, response);
	}

	public async verifyToken(req: VerifyRequest, res: Response<ApiResponse<VerifyResponse>>) {
		const { token, tokenType } = req.body;

		const type = MappingUtil.tokenTypeMapping(tokenType);

		let payload;
		switch (type) {
			case ETokenType.ACCESS:
				payload = await JwtService.verifyToken(token, "access");
				break;
			case ETokenType.ID:
				payload = await JwtService.verifyToken(token, "id");
				break;
			default:
				throw new BadRequestError(`Invalid token type: ${tokenType}`);
		}

		if (!payload) {
			throw new Error("Empty payload");
		}

		const username = (type === ETokenType.ACCESS ? payload.username : payload["cognito:username"]) as string;

		const userInfo = {
			id: payload.sub,
			username: username,
		};

		return ResponseHelper.success<VerifyResponse>(res, { user: userInfo });
	}

	public async refreshToken(req: RefreshRequest, res: Response<ApiResponse<RefreshResponse>>) {
		const { refreshToken } = req.body;
		const awsResponse = await this.authService.refreshToken(refreshToken);
		const auth = awsResponse.AuthenticationResult;
		if (
			!auth || //
			!auth.AccessToken ||
			!auth.IdToken ||
			!auth.ExpiresIn ||
			!auth.TokenType
		) {
			throw new Error("Invalid response from auth provider");
		}

		const response: RefreshResponse = {
			accessToken: auth.AccessToken,
			idToken: auth.IdToken,
			expiresIn: auth.ExpiresIn,
			tokenType: auth.TokenType,
		};
		return ResponseHelper.success<RefreshResponse>(res, response);
	}

	public async getNewOtp(req: GetOTPRequest, res: Response<ApiResponse<GetOTPResponse>>) {
		const username = req.query.email;
		const cognitoResponse = await this.authService.getOtpCode(username);

		const response: GetOTPResponse = {
			CodeDeliveryDestination: cognitoResponse.CodeDeliveryDetails?.Destination,
			CodeDeliveryMedium: cognitoResponse.CodeDeliveryDetails?.DeliveryMedium,
		};

		return ResponseHelper.success<GetOTPResponse>(res, response);
	}

	public async signOut(req: Request, res: Response) {
		const authHeader = req.headers.authorization;
		console.log(req.headers);
		if (!authHeader?.startsWith("Bearer ")) {
			throw new Error("Access token missing");
		}

		const accessToken = authHeader.split(" ")[1];

		const response = await this.authService.signOut(accessToken);
		const statusCode = response.$metadata?.httpStatusCode;

		if (statusCode !== 200) {
			throw new Error(`Error while signing out with code ${statusCode}`);
		}

		return ResponseHelper.success(res, { success: true });
	}

	public async googleCallback(req: Request, res: Response) {
		const { code } = req.query;
		if (!code) throw new BadRequestError("Missing code");
		const userInfo: GoogleOAuthResponse = await this.oauthService.exchangeUserInfo(code as string);
		const email = userInfo.email;
		const name = userInfo.name;

		const userExsitsInDb = await this.userService.getUser({ email: email });
		const userExistsInCognito = await this.authService.findUser(email);

		// If not exist, create one
		if (!userExsitsInDb && !userExistsInCognito) {
			const provider = await this.authRepository.createUserProvider(email, EProvider.Google);
			console.log("Hello I am creating user here");
			const cognitoSub = (await this.authService.oAuthSignUp(email)).UserSub;
			if (!cognitoSub) {
				throw new Error("Error while creating user");
			}
			await this.userService.saveUserDirect(cognitoSub, email, name);
			console.log(provider);
		}

		// If existed, we have 2 cases: 1. used google; 2. used password
		const userAuthProvider = (await this.authRepository.getUserProvider(email)).provider;
		// If used password, ask user to login with password instead
		if (userAuthProvider == EProvider.Credentials) {
			const message = encodeURIComponent("This account was registered using password, please try login again with your password");
			return res.redirect(`http://localhost:5173/oauth/error?message=${message}`);
		}

		const awsResponse = await this.authService.oAuthLogin(email);

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

		const userFromCognito = await JwtService.verifyIdToken(auth.IdToken);
		const userId = userFromCognito.sub;

		res.cookie("refresh_token", auth.RefreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		const encodedUser = encodeURIComponent(
			JSON.stringify({
				id: userId,
				email,
				name: name,
			})
		);

		res.redirect(`http://localhost:5173/oauth/success?accessToken=${auth.AccessToken}&idToken=${auth.IdToken}&expiresIn=${auth.ExpiresIn}&user=${encodedUser}`);
	}

	public async forgotPassword(req: ForgotPasswordRequest, res: Response<ApiResponse<ForgotPasswordResponse>>) {
		const { email } = req.body;
		if (!email) {
			throw new BadRequestError("Missing email");
		}

		// Cognito send OTP to email
		const result = await this.authService.forgotPassword(email);
		if (!result.CodeDeliveryDetails) {
			throw new IdentityProviderError("Failed to send reset code");
		}

		const response = {
			CodeDeliveryDestination: result.CodeDeliveryDetails.Destination,
			CodeDeliveryMedium: result.CodeDeliveryDetails.DeliveryMedium?.toString(),
		};

		return ResponseHelper.success<ForgotPasswordResponse>(res, response);
	}

	public async confirmForgotPassword(req: ConfirmForgotPasswordRequest, res: Response<ApiResponse<ConfirmForgotPasswordResponse>>) {
		const { email, code, newPassword } = req.body;
		if (!email || !code || !newPassword) {
			throw new BadRequestError("Missing required fields");
		}

		// Confirm OTP and update new password
		const result = await this.authService.confirmForgotPassword(email, code, newPassword);
		if (!result) {
			throw new IdentityProviderError("Invalid or expired reset code");
		}

		return ResponseHelper.success<ConfirmForgotPasswordResponse>(res, { success: true });
	}
}

export default AuthController;
