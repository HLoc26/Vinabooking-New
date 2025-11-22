import { Dialog } from "@mui/material";
import useModalContext from "../../context/ModalContext/hook";

export const ModalHost = () => {
	const { isOpen, content, closeModal } = useModalContext();

	return (
		<Dialog
			open={isOpen}
			onClose={closeModal}
			maxWidth="xs"
			fullWidth
			slotProps={{
				paper: {
					sx: {
						borderRadius: 3,
						p: 1,
						position: "relative",
					},
				},
			}}
		>
			{content}
		</Dialog>
	);
};
