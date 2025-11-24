import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import LoginModal from "../ui/LoginModal";
import useAuthContextProvider from "../../context/AuthContext/hook";

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
	const [openLoginModal, setOpenLoginModal] = useState(false);

	const handleClick = () => {
		if (canNavigate && !canNavigate()) {
			onFail?.();
			return;
		}

		if (!userInfo) {
			setOpenLoginModal(true);
			return;
		}

		navigate(to);
	};

	const handleLoginSuccess = () => {
		setOpenLoginModal(false);
		navigate(to);
	};

	return (
		<>
			<div onClick={handleClick} style={{ cursor: "pointer" }}>
				{children}
			</div>

			<LoginModal open={openLoginModal} onClose={() => setOpenLoginModal(false)} onLoginSuccess={handleLoginSuccess} />
		</>
	);
};
