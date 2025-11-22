import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import LoginModal from "../ui/LoginModal";
import useAuthContextProvider from "../../context/AuthContext/hook";

type ProtectedLinkProps = {
	to: string;
	children: React.ReactNode;
};

export const ProtectedLink: React.FC<ProtectedLinkProps> = ({ to, children }) => {
	const { getCurrentUser } = useAuthContextProvider();
	const userInfo = getCurrentUser();
	const navigate = useNavigate();
	const [openLoginModal, setOpenLoginModal] = useState(false);

	const handleClick = () => {
		if (userInfo) {
			navigate(to); // đã login thì chuyển thẳng
		} else {
			setOpenLoginModal(true); // chưa login thì mở modal
		}
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
