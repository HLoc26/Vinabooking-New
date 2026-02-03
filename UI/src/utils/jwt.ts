export const parseJwt = <T>(token: string): T | null => {
	try {
		const base64Url = token.split(".")[1];
		if (!base64Url) return null;

		const base64 = base64Url.replaceAll("-", "+").replaceAll("_", "/");
		const jsonPayload = decodeURIComponent(
			globalThis
				.atob(base64)
				.split("")
				.map((c) => {
					return "%" + ("00" + (c.codePointAt(0) ?? 0).toString(16)).slice(-2);
				})
				.join("")
		);
		return JSON.parse(jsonPayload) as T;
	} catch (e) {
		console.error("Failed to parse JWT", e);
		return null;
	}
};

export interface CognitoIdToken {
	sub: string;
	email: string;
	name: string;
	phone_number?: string;
	"custom:userType"?: string;
	exp: number;
	iss: string;
}
