import { singleton } from "tsyringe";
import { EnvironmentNotSetError } from "@/shared/error/EnvironmentNotSetError";

/** Typed, centralized access to environment configuration. */
@singleton()
export class AppConfig {
	public get(key: string): string | undefined {
		return process.env[key];
	}

	public getRequired(key: string): string {
		const value = process.env[key];
		if (value === undefined || value === "") {
			throw new EnvironmentNotSetError(`Missing env: ${key}`);
		}
		return value;
	}

	public getNumber(key: string, fallback?: number): number {
		const raw = process.env[key];
		if (raw === undefined || raw === "") {
			if (fallback !== undefined) return fallback;
			throw new EnvironmentNotSetError(`Missing env: ${key}`);
		}
		const parsed = Number.parseInt(raw, 10);
		if (Number.isNaN(parsed)) {
			throw new EnvironmentNotSetError(`Env ${key} is not a number: ${raw}`);
		}
		return parsed;
	}
}
