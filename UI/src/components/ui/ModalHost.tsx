import { Dialog } from "@mui/material";
import useModalContext from "../../context/ModalContext/hook";

export const ModalHost = () => {
	const { isOpen, content, closeModal } = useModalContext();

	return (
		<Dialog open={isOpen} onClose={closeModal} fullWidth maxWidth="sm">
			{content}
		</Dialog>
	);
};
