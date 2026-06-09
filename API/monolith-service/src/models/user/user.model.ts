import { UserRole } from "./user.enums";

export class User {
    public constructor(
        private readonly id: string,
        private readonly email: string,
        private readonly name: string,
        private readonly phone: string | null,
        private readonly role: UserRole,
        private readonly createdAt: Date,
        private readonly updatedAt: Date
    ) {
        this.validateEmail(email);
        this.validateName(name);
    }

    public getId(): string { return this.id; }
    public getEmail(): string { return this.email; }
    public getName(): string { return this.name; }
    public getPhone(): string | null { return this.phone; }
    public getRole(): UserRole { return this.role; }
    public getCreatedAt(): Date { return this.createdAt; }
    public getUpdatedAt(): Date { return this.updatedAt; }

    /**
     * Domain Logic: Validate email format
     */
    private validateEmail(email: string): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error(`Invalid email format: ${email}`);
        }
    }

    /**
     * Domain Logic: Ensure name is not empty or just whitespace
     */
    private validateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new Error("User name cannot be empty");
        }
    }

    public static builder() {
        return new UserBuilder();
    }
}

export class UserBuilder {
    private id?: string;
    private email?: string;
    private name?: string;
    private phone: string | null = null;
    private role: UserRole = UserRole.TRAVELLER;
    private createdAt?: Date;
    private updatedAt?: Date;

    public setId(id: string): this { this.id = id; return this; }
    public setEmail(email: string): this { this.email = email; return this; }
    public setName(name: string): this { this.name = name; return this; }
    public setPhone(phone: string | null): this { this.phone = phone; return this; }
    public setRole(role: UserRole): this { this.role = role; return this; }
    public setCreatedAt(createdAt: Date): this { this.createdAt = createdAt; return this; }
    public setUpdatedAt(updatedAt: Date): this { this.updatedAt = updatedAt; return this; }

    public build(): User {
        if (!this.id || !this.email || !this.name) {
            throw new Error("Missing required fields in UserBuilder");
        }

        const now = new Date();
        const createdAt = this.createdAt || now;
        const updatedAt = this.updatedAt || now;

        return new User(
            this.id,
            this.email,
            this.name,
            this.phone,
            this.role,
            createdAt,
            updatedAt
        );
    }
}
