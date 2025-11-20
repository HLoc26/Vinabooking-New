import { useContext } from "react";
import AuthContext from "./context";

const useAuthContextProvider = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error("useAuthContextProvider must be used within AuthContextProvider");
	}
	return ctx;
};

export default useAuthContextProvider;
