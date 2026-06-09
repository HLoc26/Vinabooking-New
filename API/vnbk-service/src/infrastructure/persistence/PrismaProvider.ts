import { singleton } from "tsyringe";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/client";
import { AppConfig } from "@/config/AppConfig";

/**
 * Owns the single PrismaClient instance (Singleton). DAOs inject this provider
 * and use `.client`. This is the ONLY place outside dao/ that touches Prisma.
 */
@singleton()
export class PrismaProvider {
	private readonly _client: PrismaClient;

	constructor(config: AppConfig) {
		const adapter = new PrismaMariaDb({
			host: config.getRequired("DB_HOST"),
			port: config.getNumber("DB_PORT", 3306),
			user: config.getRequired("DB_USER"),
			password: config.getRequired("DB_PWD"),
			database: config.getRequired("DB_NAME"),
			connectionLimit: 5,
			allowPublicKeyRetrieval: true,
			ssl: false,
		});
		this._client = new PrismaClient({ adapter });
	}

	public get client(): PrismaClient {
		return this._client;
	}

	public async connect(): Promise<void> {
		await this._client.$connect();
	}

	public async disconnect(): Promise<void> {
		await this._client.$disconnect();
	}
}
