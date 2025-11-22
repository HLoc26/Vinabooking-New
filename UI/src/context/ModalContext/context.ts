import { createContext } from "react";

type ModalContextValue = {
	isOpen: boolean;
	content: React.ReactNode | null;
	openModal: (content: React.ReactNode) => void;
	closeModal: () => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export default ModalContext;
