import { AuthProvider } from "./auth.enums";

export class UserAuthProvider {
    public constructor(
        private readonly email: string,
        private readonly userId: string,
        private readonly provider: AuthProvider
    ) {
        this.validateEmail(email);
        this.validateUserId(userId);
    }

    public getEmail(): string { return this.email; }
    public getUserId(): string { return this.userId; }
    public getProvider(): AuthProvider { return this.provider; }

    private validateEmail(email: string): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error(`Invalid email format: ${email}`);
        }
    }

    private validateUserId(userId: string): void {
        if (!userId || userId.trim().length === 0) {
            throw new Error("UserId cannot be empty");
        }
    }

    public static builder() {
        return new UserAuthProviderBuilder();
    }
}

export class UserAuthProviderBuilder {
    private email?: string;
    private userId?: string;
    private provider: AuthProvider = AuthProvider.CREDENTIALS;

    public setEmail(email: string): this { this.email = email; return this; }
    public setUserId(userId: string): this { this.userId = userId; return this; }
    public setProvider(provider: AuthProvider): this { this.provider = provider; return this; }

    public build(): UserAuthProvider {
        if (!this.email || !this.userId) {
            throw new Error("Missing required fields in UserAuthProviderBuilder");
        }

        return new UserAuthProvider(
            this.email,
            this.userId,
            this.provider
        );
    }
}
