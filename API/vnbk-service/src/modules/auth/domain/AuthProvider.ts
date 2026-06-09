import { Entity } from "@/shared/domain/Entity";
import { EProvider } from "@/modules/auth/enums/EProvider";

export interface AuthProviderProps {
	userId: string;
	email: string;
	provider: EProvider;
}

/**
 * Links a user account to an authentication provider (Credentials / Google).
 * Mirrors the Prisma `UserAuthProvider` model, whose identity is the composite
 * (userId, provider) — surfaced here as the entity id `"<userId>:<provider>"`.
 */
export class AuthProvider extends Entity {
	private readonly _userId: string;
	private readonly _email: string;
	private readonly _provider: EProvider;

	private constructor(props: AuthProviderProps) {
		super(`${props.userId}:${props.provider}`);
		this._userId = props.userId;
		this._email = props.email;
		this._provider = props.provider;
	}

	/** Create a brand-new provider link for a user. */
	public static create(props: AuthProviderProps): AuthProvider {
		return new AuthProvider(props);
	}

	/** Reconstitute a provider link from persistence. */
	public static rehydrate(props: AuthProviderProps): AuthProvider {
		return new AuthProvider(props);
	}

	public get userId(): string {
		return this._userId;
	}

	public get email(): string {
		return this._email;
	}

	public get provider(): EProvider {
		return this._provider;
	}
}
