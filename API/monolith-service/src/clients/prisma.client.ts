import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/client";
import EnvironmentNotSetError from "@/errors/EnvironmentNotSetError";

if (!process.env["DB_HOST"]) {
	throw new EnvironmentNotSetError("Missing env: DB_HOST");
}

if (!process.env["DB_PORT"]) {
	throw new EnvironmentNotSetError("Missing env: DB_PORT");
}

if (!process.env["DB_USER"]) {
	throw new EnvironmentNotSetError("Missing env: DB_USER");
}

if (!process.env["DB_PWD"]) {
	throw new EnvironmentNotSetError("Missing env: DB_PWD");
}

if (!process.env["DB_NAME"]) {
	throw new EnvironmentNotSetError("Missing env: DB_NAME");
}
const isSecured = process.env["DB_SECURED"] === "true";
const adapter = new PrismaMariaDb({
	// Connection setting
	host: process.env["DB_HOST"]!,
	port: Number.parseInt(process.env["DB_PORT"]!),
	// Credentials
	user: process.env["DB_USER"],
	password: process.env["DB_PWD"],

	database: process.env["DB_NAME"],
	connectionLimit: 10,

	allowPublicKeyRetrieval: true,
	ssl: isSecured
		? true
		: { rejectUnauthorized: false },
	connectTimeout: 10000,
});

const prismaClient = new PrismaClient({ adapter });
export default prismaClient;
