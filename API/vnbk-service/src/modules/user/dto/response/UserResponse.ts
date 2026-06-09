import { ERole } from "@/modules/user/enums/ERole";

/** Wire representation of a user (decoupled from domain + persistence). */
export class UserResponse {
	id!: string;
	email!: string;
	name!: string;
	phone!: string | null;
	role!: ERole;
}
