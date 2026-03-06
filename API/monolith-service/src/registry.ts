import prismaClient from "./clients/prisma.client";
import redisClient from "./clients/redis.client";
import UserRepository from "./repositories/user.repository";

export const userRepository = new UserRepository(prismaClient);

export { redisClient };
