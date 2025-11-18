import { EUserRole } from "../types/User";

export const userRoleMapper = (userType: "TRAVELLER" | "ACCOMMODATION_OWNER") => {
	return userType === "TRAVELLER" ? EUserRole.TRAVELLER : EUserRole.ACCOMMODATION_OWNER;
};
