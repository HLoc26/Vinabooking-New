import React from "react";
import { Dialog, DialogContent, DialogTitle, IconButton, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LoginForm from "../../features/auth/components/LoginForm";

type Props = {
	open: boolean;
	onClose: () => void;
	onLoginSuccess: () => void;
};

const LoginModal: React.FC<Props> = ({ open, onClose, onLoginSuccess }) => {
	return (
		<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
			<Box display="flex" justifyContent="space-between" alignItems="center">
				<DialogTitle sx={{ fontWeight: 600, p: 2 }}>Login</DialogTitle>

				<IconButton onClick={onClose} sx={{ mr: 1 }}>
					<CloseIcon />
				</IconButton>
			</Box>

			<DialogContent sx={{ pt: 0 }}>
				<LoginForm onSuccess={onLoginSuccess} />
			</DialogContent>
		</Dialog>
	);
};

export default LoginModal;
