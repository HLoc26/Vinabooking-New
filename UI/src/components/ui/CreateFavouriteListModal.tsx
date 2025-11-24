import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";

type CreateFavouriteListModalProps = {
	open: boolean;
	onClose: () => void;
	onCreate: (name: string) => Promise<void>;
	loading?: boolean;
};

const CreateFavouriteListModal: React.FC<CreateFavouriteListModalProps> = ({ open, onClose, onCreate, loading }) => {
	const [name, setName] = useState("");

	const handleCreate = async () => {
		if (!name.trim()) return;
		await onCreate(name.trim());
		setName("");
		onClose();
	};

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>Create Favourite List</DialogTitle>
			<DialogContent>
				<TextField autoFocus margin="dense" label="List Name" type="text" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button variant="contained" disabled={!name.trim() || loading} onClick={handleCreate}>
					Create
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CreateFavouriteListModal;
