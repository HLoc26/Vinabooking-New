import useAuth from "../../hooks/useAuth";
import AuthContext from "./context";

const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { login, logout, getCurrentUser, loading, error } = useAuth();
	return <AuthContext.Provider value={{ login, logout, getCurrentUser, loading, error }}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;
