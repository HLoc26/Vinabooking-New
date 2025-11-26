import { createContext } from "react";
import type useUserProfileInfo from "../../hooks/useUserProfileInfo";

const UserContext = createContext<ReturnType<typeof useUserProfileInfo> | null>(null);

export default UserContext;
