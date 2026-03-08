import Cookies from "js-cookie";
import type { UserDto } from "../../user/types/UserDto";
import type { OwnerProfileData } from "../../owner/types/owner.types";

const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY || "access_token";
const USER_KEY = import.meta.env.VITE_USER_KEY || "user_info";
const OWNER_KEY = import.meta.env.VITE_OWNER_KEY || "owner_info";

// Auth storage utility
export const authStorage = {
	// --- Access Token ---
	getAccessToken(): string | undefined {
		return Cookies.get(ACCESS_TOKEN_KEY);
	},

	setAccessToken(token: string): void {
		Cookies.set(ACCESS_TOKEN_KEY, token, { path: "/", secure: globalThis.location.protocol === "https:", sameSite: "lax", expires: 7 });
	},

	clearAccessToken(): void {
		Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
	},

	// --- User Info ---
	getUserSync<T = UserDto>(): T | null {
		const raw = localStorage.getItem(USER_KEY);
		if (!raw) return null;
		try {
			return JSON.parse(raw) as T;
		} catch (error) {
			console.error("Error parsing user from local storage", error);
			localStorage.removeItem(USER_KEY);
			return null;
		}
	},

	setUser(user: Partial<UserDto>): void {
		localStorage.setItem(USER_KEY, JSON.stringify(user));
	},

	clearUser(): void {
		localStorage.removeItem(USER_KEY);
	},

	// --- Owner Profile ---
	getOwnerProfileSync<T = OwnerProfileData>(): T | null {
		const raw = localStorage.getItem(OWNER_KEY);
		if (!raw) return null;
		try {
			return JSON.parse(raw) as T;
		} catch (error) {
			console.error("Error parsing owner profile from local storage", error);
			localStorage.removeItem(OWNER_KEY);
			return null;
		}
	},

	setOwnerProfile(ownerProfile: Partial<OwnerProfileData>): void {
		localStorage.setItem(OWNER_KEY, JSON.stringify(ownerProfile));
	},
};
