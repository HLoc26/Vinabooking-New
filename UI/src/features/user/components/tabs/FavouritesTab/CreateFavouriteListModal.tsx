import React, { useState } from "react";
import { DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import useModalContext from "../../../../../context/ModalContext/hook";

type CreateFavouriteListModalProps = {
	onCreate: (name: string) => Promise<void>;
	loading?: boolean;
	autoClose?: boolean;
};

const CreateFavouriteListModal: React.FC<CreateFavouriteListModalProps> = ({ onCreate, loading, autoClose = true }) => {
	const { closeModal } = useModalContext();

	const [name, setName] = useState("");

	const handleCreate = async () => {
		if (!name.trim()) return;
		await onCreate(name.trim());
		setName("");
		if (autoClose) closeModal();
	};

	return (
		<>
			<DialogTitle>Create Favourite List</DialogTitle>
			<DialogContent>
				<TextField autoFocus margin="dense" label="List Name" type="text" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
			</DialogContent>
			<DialogActions>
				<Button onClick={closeModal}>Cancel</Button>
				<Button variant="contained" disabled={!name.trim() || loading} onClick={handleCreate}>
					Create
				</Button>
			</DialogActions>
		</>
	);
};

export default CreateFavouriteListModal;
