import { AggregateRoot } from "@/shared/domain/AggregateRoot";
import { ERole } from "@/modules/user/enums/ERole";
import { BadRequestError } from "@/shared/error/BadRequestError";

export interface UserProps {
	id: string;
	email: string;
	name: string;
	phone: string | null;
	role: ERole;
	createdAt?: Date;
	updatedAt?: Date;
}

/** The User aggregate root. Holds profile state + role and enforces its invariants. */
export class User extends AggregateRoot {
	private _email: string;
	private _name: string;
	private _phone: string | null;
	private _role: ERole;
	public readonly createdAt?: Date;
	public readonly updatedAt?: Date;

	private constructor(props: UserProps) {
		super(props.id);
		this._email = props.email;
		this._name = props.name;
		this._phone = props.phone;
		this._role = props.role;
		this.createdAt = props.createdAt;
		this.updatedAt = props.updatedAt;
	}

	/** Create a brand-new user. The id is the Cognito sub (UUIDv4). */
	public static create(props: { id: string; email: string; name: string; phone?: string | null; role?: ERole }): User {
		if (!props.id) throw new BadRequestError("User id is required");
		if (!props.email) throw new BadRequestError("User email is required");
		if (!props.name) throw new BadRequestError("User name is required");
		return new User({
			id: props.id,
			email: props.email,
			name: props.name,
			phone: props.phone ?? null,
			role: props.role ?? ERole.TRAVELLER,
		});
	}

	/** Reconstitute a user from persistence (no invariant re-check). */
	public static rehydrate(props: UserProps): User {
		return new User(props);
	}

	public get email(): string {
		return this._email;
	}

	public get name(): string {
		return this._name;
	}

	public get phone(): string | null {
		return this._phone;
	}

	public get role(): ERole {
		return this._role;
	}

	public updateProfile(name?: string, phone?: string | null): void {
		if (name !== undefined) this._name = name;
		if (phone !== undefined) this._phone = phone;
	}

	public isOwner(): boolean {
		return this._role === ERole.ACCOMMODATION_OWNER;
	}
}
