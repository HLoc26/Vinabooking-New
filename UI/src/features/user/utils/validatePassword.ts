export interface PasswordChecklist {
	length: boolean;
	upper: boolean;
	lower: boolean;
	number: boolean;
	special: boolean;
}

export function getPasswordChecklist(password: string): PasswordChecklist {
	return {
		length: password.length >= 8,
		upper: /[A-Z]/.test(password),
		lower: /[a-z]/.test(password),
		number: /[0-9]/.test(password),
		special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
	};
}

export function validatePassword(password: string): string | null {
	const c = getPasswordChecklist(password);

	if (!password) return "Password is required.";
	if (!c.length) return "Password must be at least 8 characters long.";
	if (!c.upper) return "Password must contain an uppercase letter.";
	if (!c.lower) return "Password must contain a lowercase letter.";
	if (!c.number) return "Password must contain a number.";
	if (!c.special) return "Password must contain a special character.";
	return null;
}
