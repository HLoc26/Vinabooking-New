import { PrismaClient } from "../../generated/prisma/client";

class PrismaSingleton {
	private static instance: PrismaClient;

	constructor() {}

	public static getInstance(): PrismaClient {
		if (!PrismaSingleton.instance) {
			PrismaSingleton.instance = new PrismaClient();
		}
		return PrismaSingleton.instance;
	}
}

export default PrismaSingleton;
