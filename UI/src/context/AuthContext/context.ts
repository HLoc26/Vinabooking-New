import { createContext } from "react";
import useAuth from "../../features/user/hooks/useAuth";
const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

export default AuthContext;
