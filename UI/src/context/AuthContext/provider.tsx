import useAuth from "../../hooks/useAuth";
import AuthContext from "./context";

const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const auth = useAuth();
	return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;
