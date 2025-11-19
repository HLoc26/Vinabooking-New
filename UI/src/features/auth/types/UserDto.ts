export type EUserType = "TRAVELLER" | "ACCOMMODATION_OWNER";

export interface UserDto {
	id?: string;
	name: string;
	email: string;
	phone: string;
	userType: EUserType;
}
