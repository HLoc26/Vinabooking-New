import { UserAuthProvider as PrismaUserAuthProvider, EProvider } from "@/generated/client";
import { UserAuthProvider, AuthProvider } from "@/models/auth";

export class AuthMapper {
    public static toDomain(prismaModel: PrismaUserAuthProvider): UserAuthProvider {
        return UserAuthProvider.builder()
            .setEmail(prismaModel.email)
            .setUserId(prismaModel.userId)
            .setProvider(this.mapProviderToDomain(prismaModel.provider))
            .build();
    }

    public static toPersistence(domainModel: UserAuthProvider): Omit<PrismaUserAuthProvider, "id"> {
        return {
            email: domainModel.getEmail(),
            userId: domainModel.getUserId(),
            provider: this.mapProviderToPersistence(domainModel.getProvider())
        };
    }

    private static mapProviderToDomain(provider: EProvider): AuthProvider {
        switch (provider) {
            case EProvider.Credentials:
                return AuthProvider.CREDENTIALS;
            case EProvider.Google:
                return AuthProvider.GOOGLE;
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }

    private static mapProviderToPersistence(provider: AuthProvider): EProvider {
        switch (provider) {
            case AuthProvider.CREDENTIALS:
                return EProvider.Credentials;
            case AuthProvider.GOOGLE:
                return EProvider.Google;
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }
}
