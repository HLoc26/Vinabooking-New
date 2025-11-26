import { useContext } from "react";
import ModalContext from "./context";

const useModalContext = () => {
	const ctx = useContext(ModalContext);
	if (!ctx) {
		throw new Error("useModalContext must be used inside ModalProvider");
	}
	return ctx;
};
export default useModalContext;
