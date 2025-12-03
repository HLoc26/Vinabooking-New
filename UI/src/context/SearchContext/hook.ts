import { useContext } from "react";
import SearchContext from "./context";

const useSearchContext = () => {
	const context = useContext(SearchContext);
	if (!context) {
		throw new Error("useSearchContext must be used within SearchProvider");
	}
	return context;
};
export default useSearchContext;