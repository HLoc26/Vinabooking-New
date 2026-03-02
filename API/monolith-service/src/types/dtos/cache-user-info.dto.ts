import { UserCreateInput } from "@/generated/models";

export interface UserCacheInfo {
	email: string; // key
	info: UserCreateInput;
}
