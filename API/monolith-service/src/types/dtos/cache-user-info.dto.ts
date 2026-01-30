import { ERole } from "@/generated/enums";

export interface UserCacheInfo {
	email: string; // key
	info: {
		cognitoSub: string;
		name: string;
		phone: string | null;
		userType: ERole;
	};
}
