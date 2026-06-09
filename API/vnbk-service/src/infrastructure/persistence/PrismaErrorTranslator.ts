import { AppError } from "@/shared/error/AppError";
import { ConflictError } from "@/shared/error/ConflictError";
import { NotFoundError } from "@/shared/error/NotFoundError";
import { DatabaseError } from "@/shared/error/DatabaseError";

/**
 * Translates Prisma errors into domain AppErrors so the DAO boundary never leaks
 * raw persistence errors upward. Duck-types the error `code` to stay decoupled
 * from the generated Prisma runtime types.
 */
export class PrismaErrorTranslator {
	public static translate(err: unknown): AppError {
		if (err instanceof AppError) return err;

		const code = (err as { code?: unknown })?.code;
		if (typeof code === "string") {
			if (code === "P2002") {
				const meta = (err as { meta?: { target?: string[] | string } }).meta;
				const target = meta?.target;
				const fields = Array.isArray(target) ? target.join(", ") : target;
				return new ConflictError(fields ? `A record with this ${fields} already exists` : "Unique constraint violation", "DUPLICATE");
			}
			if (code === "P2025") {
				return new NotFoundError("Record not found");
			}
			if (code.startsWith("P")) {
				return new DatabaseError(`Database error (${code})`);
			}
		}

		return new DatabaseError(err instanceof Error ? err.message : "Unknown database error");
	}
}
