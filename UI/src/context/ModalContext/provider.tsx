import ModalContext from "./context";
import { ModalHost } from "../../components/shared/ModalHost";
import useModal from "../../hooks/useModal";

const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const modal = useModal();

	return (
		<ModalContext.Provider value={modal}>
			{children}
			<ModalHost />
		</ModalContext.Provider>
	);
};

export default ModalProvider;
