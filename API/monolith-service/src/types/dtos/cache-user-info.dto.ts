import { ERole } from "@/generated/enums";

export interface UserCacheInfo {
	email: string; // key
	info: {
		id: string; // cognito sub
		name: string;
		phone: string | null;
		userType: ERole;
	};
}
