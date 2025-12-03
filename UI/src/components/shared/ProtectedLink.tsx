import { useNavigate } from "react-router-dom";
import React from "react";
import LoginModal from "../../features/auth/components/LoginModal";
import useAuthContextProvider from "../../context/AuthContext/hook";
import useModalContext from "../../context/ModalContext/hook";

type ProtectedLinkProps = {
	to: string;
	children: React.ReactNode;
	canNavigate?: () => boolean;
	onFail?: () => void;
};

export const ProtectedLink: React.FC<ProtectedLinkProps> = ({ to, children, canNavigate, onFail }) => {
	const { getCurrentUser } = useAuthContextProvider();
	const userInfo = getCurrentUser();
	const navigate = useNavigate();

	const { openModal, closeModal } = useModalContext();

	const handleClick = () => {
		if (canNavigate && !canNavigate()) {
			onFail?.();
			return;
		}

		if (!userInfo) {
			openModal(<LoginModal onLoginSuccess={() => closeModal()} />); // chưa login thì mở modal
			return;
		}

		navigate(to);
	};

	return (
		<>
			<div onClick={handleClick} style={{ cursor: "pointer" }}>
				{children}
			</div>
		</>
	);
};
