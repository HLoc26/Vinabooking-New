import React from "react";
import { DialogContent, DialogTitle, IconButton, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LoginForm from "../../features/auth/components/LoginForm";
import useModalContext from "../../context/ModalContext/hook";

type LoginModalProps = {
	onLoginSuccess: () => void;
};

const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
	const { closeModal } = useModalContext();

	return (
		<>
			<Box display="flex" justifyContent="space-between" alignItems="center">
				<DialogTitle sx={{ fontWeight: 600, p: 2 }}>Login</DialogTitle>

				<IconButton onClick={closeModal} sx={{ mr: 1 }}>
					<CloseIcon />
				</IconButton>
			</Box>

			<DialogContent sx={{ pt: 0 }}>
				<LoginForm onSuccess={onLoginSuccess} />
			</DialogContent>
		</>
	);
};

export default LoginModal;
