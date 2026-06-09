import { injectable } from "tsyringe";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { plainToInstance, type ClassConstructor } from "class-transformer";
import { validate, type ValidationError } from "class-validator";
import { BadRequestError } from "@/shared/error/BadRequestError";

/**
 * Validates + transforms a request payload into a DTO class using class-validator.
 * Shape/format validation only; business rules stay in the domain/service.
 */
@injectable()
export class ValidationPipe {
	public body<T extends object>(dto: ClassConstructor<T>): RequestHandler {
		return this.build(dto, "body");
	}

	public query<T extends object>(dto: ClassConstructor<T>): RequestHandler {
		return this.build(dto, "query");
	}

	private build<T extends object>(dto: ClassConstructor<T>, source: "body" | "query"): RequestHandler {
		return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
			try {
				const raw = (source === "body" ? req.body : req.query) ?? {};
				const instance = plainToInstance(dto, raw, { enableImplicitConversion: true });
				const errors = await validate(instance, {
					whitelist: true,
					forbidNonWhitelisted: true,
				});
				if (errors.length > 0) {
					throw new BadRequestError("Validation failed", this.flatten(errors));
				}
				if (source === "body") {
					req.validatedBody = instance;
				} else {
					req.validatedQuery = instance;
				}
				next();
			} catch (err) {
				next(err);
			}
		};
	}

	private flatten(errors: ValidationError[]): string[] {
		const messages: string[] = [];
		for (const error of errors) {
			if (error.constraints) {
				messages.push(...Object.values(error.constraints));
			}
			if (error.children && error.children.length > 0) {
				messages.push(...this.flatten(error.children));
			}
		}
		return messages;
	}
}
