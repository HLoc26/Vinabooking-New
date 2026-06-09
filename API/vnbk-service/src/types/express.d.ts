import "express";

// Augment the Express Request with values populated by guards / validation pipe.
declare global {
	namespace Express {
		interface Request {
			userId?: string;
			userRole?: string;
			validatedBody?: unknown;
			validatedQuery?: unknown;
		}
	}
}

export {};
