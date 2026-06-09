// Public surface of the user module. Other modules import ONLY from here.
export type { IUserService, PendingUserInfo } from "@/modules/user/service/IUserService";
export { USER_SERVICE } from "@/modules/user/user.tokens";
export { User } from "@/modules/user/domain/User";
export { ERole } from "@/modules/user/enums/ERole";
export { UserResponse } from "@/modules/user/dto/response/UserResponse";
export { UserModule } from "@/modules/user/UserModule";
