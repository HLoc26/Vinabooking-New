import type { DependencyContainer } from "@/di/container";
import type { IModule } from "@/di/IModule";
import { CACHE_SERVICE, TOKEN_VERIFIER, EVENT_PUBLISHER, MAIL_SENDER, OBJECT_STORAGE } from "@/infrastructure/infrastructure.tokens";
import { RedisCacheService } from "@/infrastructure/cache/RedisCacheService";
import { CognitoTokenVerifier } from "@/infrastructure/auth-idp/CognitoTokenVerifier";
import { InProcessEventPublisher } from "@/shared/events/InProcessEventPublisher";
import { SmtpMailSender } from "@/infrastructure/mail/SmtpMailSender";
import { S3Storage } from "@/infrastructure/storage/S3Storage";

/** Binds shared infrastructure ports to their singleton adapter implementations. */
export class InfrastructureModule implements IModule {
	public register(container: DependencyContainer): void {
		container.registerSingleton(CACHE_SERVICE, RedisCacheService);
		container.registerSingleton(TOKEN_VERIFIER, CognitoTokenVerifier);
		container.registerSingleton(EVENT_PUBLISHER, InProcessEventPublisher);
		container.registerSingleton(MAIL_SENDER, SmtpMailSender);
		container.registerSingleton(OBJECT_STORAGE, S3Storage);
	}
}
