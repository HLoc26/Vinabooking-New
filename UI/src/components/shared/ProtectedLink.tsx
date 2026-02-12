import { useNavigate } from "react-router-dom";
import React from "react";
import LoginModal from "./LoginModal";
import useModalContext from "../../context/ModalContext/hook";
import { authStorage } from "../../features/auth/utils/authStorage";

type ProtectedLinkProps = {
	to: string;
	children: React.ReactNode;
	canNavigate?: () => boolean;
	onFail?: () => void;
};

export const ProtectedLink: React.FC<ProtectedLinkProps> = ({ to, children, canNavigate, onFail }) => {
	const navigate = useNavigate();
	const { openModal, closeModal } = useModalContext();

	const handleClick = () => {
		if (canNavigate && !canNavigate()) {
			onFail?.();
			return;
		}

		const isAuthenticated = !!authStorage.getAccessToken();

		if (!isAuthenticated) {
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
