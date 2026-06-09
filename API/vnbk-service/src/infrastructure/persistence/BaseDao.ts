import { PrismaErrorTranslator } from "@/infrastructure/persistence/PrismaErrorTranslator";

/**
 * Base for all DAOs. `run` wraps a Prisma operation and translates any Prisma
 * error into a domain AppError, keeping persistence errors out of the upper layers.
 */
export abstract class BaseDao {
	protected async run<T>(operation: () => Promise<T>): Promise<T> {
		try {
			return await operation();
		} catch (err) {
			throw PrismaErrorTranslator.translate(err);
		}
	}
}
