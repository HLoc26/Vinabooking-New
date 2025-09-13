import { PrismaClient } from "../../generated/prisma/index.js";

class PrismaSingleton {
    private static instance: PrismaClient;
    constructor() {}

    public static getInstance(): PrismaClient {
        if (!PrismaSingleton.instance) {
            PrismaSingleton.instance = new PrismaClient();
        }
        return this.instance;
    }
}

export default PrismaSingleton;
