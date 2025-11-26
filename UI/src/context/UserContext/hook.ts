import { useContext } from "react";
import UserContext from "./context";

const useUserContextProvider = () => {
	const ctx = useContext(UserContext);
	if (!ctx) {
		throw new Error("useUserContextProvider must be used within UserContextProvider");
	}
	return ctx;
};

export default useUserContextProvider;
