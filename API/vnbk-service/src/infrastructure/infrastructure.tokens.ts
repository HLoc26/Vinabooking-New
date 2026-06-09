/** DI tokens for infrastructure ports (interfaces resolved to singleton adapters). */
export const CACHE_SERVICE = Symbol("ICacheService");
export const TOKEN_VERIFIER = Symbol("ITokenVerifier");
export const EVENT_PUBLISHER = Symbol("IDomainEventPublisher");
export const MAIL_SENDER = Symbol("IMailSender");
export const OBJECT_STORAGE = Symbol("IObjectStorage");
