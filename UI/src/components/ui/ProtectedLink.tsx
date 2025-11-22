import { useNavigate } from "react-router-dom";
import React from "react";
import LoginModal from "../../features/auth/components/LoginModal";
import useAuthContextProvider from "../../context/AuthContext/hook";
import useModalContext from "../../context/ModalContext/hook";

type ProtectedLinkProps = {
	to: string;
	children: React.ReactNode;
};

export const ProtectedLink: React.FC<ProtectedLinkProps> = ({ to, children }) => {
	const { getCurrentUser } = useAuthContextProvider();
	const userInfo = getCurrentUser();
	const navigate = useNavigate();

	const { openModal, closeModal } = useModalContext();

	const handleClick = () => {
		if (userInfo) {
			navigate(to); // đã login thì chuyển thẳng
		} else {
			openModal(<LoginModal onLoginSuccess={() => closeModal()} />); // chưa login thì mở modal
		}
	};

	return (
		<>
			<div onClick={handleClick} style={{ cursor: "pointer" }}>
				{children}
			</div>
		</>
	);
};
