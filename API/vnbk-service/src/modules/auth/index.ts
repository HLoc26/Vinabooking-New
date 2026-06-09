// Public surface of the auth module. Other modules import ONLY from here.
export type { IAuthService } from "@/modules/auth/service/IAuthService";
export { AUTH_SERVICE } from "@/modules/auth/auth.tokens";
export { AuthModule } from "@/modules/auth/AuthModule";
