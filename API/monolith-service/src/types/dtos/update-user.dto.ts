import { UserUpdateInput as PrismaInput } from "@/generated/models";

export type UserUpdateInput = Pick<PrismaInput, "name" | "phone">;
