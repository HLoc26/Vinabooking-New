import { User } from "@/models/user";
import { User as PrismaUser, ERole } from "@/generated/client";
import { UserRole } from "@/models/user/user.enums";

export class UserMapper {
    /**
     * Map Prisma User to pure Domain Model
     */
    public static toDomain(prismaUser: PrismaUser): User {
        return User.builder()
            .setId(prismaUser.id)
            .setEmail(prismaUser.email)
            .setName(prismaUser.name)
            .setPhone(prismaUser.phone)
            .setRole(this.mapRole(prismaUser.role))
            .setCreatedAt(prismaUser.createdAt)
            .setUpdatedAt(prismaUser.updatedAt)
            .build();
    }

    private static mapRole(prismaRole: ERole): UserRole {
        switch (prismaRole) {
            case ERole.TRAVELLER:
                return UserRole.TRAVELLER;
            case ERole.ACCOMMODATION_OWNER:
                return UserRole.ACCOMMODATION_OWNER;
            default:
                throw new Error(`Unknown role: ${prismaRole}`);
        }
    }
}
