import { UserRole } from "./user.enums";

export class User {
    readonly #updatedAt: Date;
    readonly #createdAt: Date;
    readonly #role: UserRole;
    readonly #phone: string | null;
    readonly #name: string;
    readonly #email: string;
    readonly #id: string;

    public constructor(
        id: string,
        email: string,
        name: string,
        phone: string | null,
        role: UserRole,
        createdAt: Date,
        updatedAt: Date
    ) {
        this.#id = id;
        this.#email = email;
        this.#name = name;
        this.#phone = phone;
        this.#role = role;
        this.#createdAt = createdAt;
        this.#updatedAt = updatedAt;
        this.validateEmail(email);
        this.validateName(name);
    }

    public getId(): string { return this.#id; }
    public getEmail(): string { return this.#email; }
    public getName(): string { return this.#name; }
    public getPhone(): string | null { return this.#phone; }
    public getRole(): UserRole { return this.#role; }
    public getCreatedAt(): Date { return this.#createdAt; }
    public getUpdatedAt(): Date { return this.#updatedAt; }

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
    #id?: string;
    #email?: string;
    #name?: string;
    #phone: string | null = null;
    #role: UserRole = UserRole.TRAVELLER;
    #createdAt?: Date;
    #updatedAt?: Date;

    public setId(id: string): this { this.#id = id; return this; }
    public setEmail(email: string): this { this.#email = email; return this; }
    public setName(name: string): this { this.#name = name; return this; }
    public setPhone(phone: string | null): this { this.#phone = phone; return this; }
    public setRole(role: UserRole): this { this.#role = role; return this; }
    public setCreatedAt(createdAt: Date): this { this.#createdAt = createdAt; return this; }
    public setUpdatedAt(updatedAt: Date): this { this.#updatedAt = updatedAt; return this; }

    public build(): User {
        if (!this.#id || !this.#email || !this.#name) {
            throw new Error("Missing required fields in UserBuilder");
        }

        const now = new Date();
        const createdAt = this.#createdAt || now;
        const updatedAt = this.#updatedAt || now;

        return new User(
            this.#id,
            this.#email,
            this.#name,
            this.#phone,
            this.#role,
            createdAt,
            updatedAt
        );
    }
}
