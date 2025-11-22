import { DialogTitle, DialogContent, List, ListItem, ListItemIcon, Checkbox, ListItemText, DialogActions, Button, CircularProgress, Stack } from "@mui/material";
import type { FavouriteList } from "../../../types/FavouriteList";
import useModalContext from "../../../context/ModalContext/hook";
import { useState, useEffect } from "react";
import useUserFavouriteList from "../../../hooks/useUserFavouriteList";
import CreateFavouriteListModal from "./tabs/FavouritesTab/CreateFavouriteListModal";

type FavouritePickerModalProps = {
	accommodationId: string;
	onAdd: (listId: string, accId: string) => Promise<void>;
	onRemove: (listId: string, accId: string) => Promise<void>;
	loading?: boolean;
};

const FavouritePickerModal: React.FC<FavouritePickerModalProps> = ({ accommodationId, onAdd, onRemove, loading = false }) => {
	const { openModal, closeModal } = useModalContext();
	const { favouriteLists, handleCreateFavouriteList } = useUserFavouriteList();
	// Local state để toggle thoải mái
	const [localLists, setLocalLists] = useState<FavouriteList[]>([]);

	useEffect(() => {
		setLocalLists(favouriteLists);
	}, [favouriteLists]);

	const handleToggle = (listId: string) => {
		setLocalLists((prev) =>
			prev.map((f) => {
				if (f.id !== listId) return f;
				const exists = f.items.some((i) => i.accommodationId === accommodationId);
				if (exists) {
					return { ...f, items: f.items.filter((i) => i.accommodationId !== accommodationId) };
				} else {
					return { ...f, items: [...f.items, { id: "", accommodationId }] };
				}
			})
		);
	};

	const handleApply = async () => {
		for (const list of localLists) {
			const original = favouriteLists.find((l) => l.id === list.id);
			if (!original) continue;

			const originalIds = original.items.map((i) => i.accommodationId);
			const newIds = list.items.map((i) => i.accommodationId);

			// Add new
			for (const accId of newIds.filter((id) => !originalIds.includes(id))) {
				await onAdd(list.id, accId);
			}

			// Remove
			for (const accId of originalIds.filter((id) => !newIds.includes(id))) {
				await onRemove(list.id, accId);
			}
		}
		closeModal();
	};

	const handleCreateNew = () => {
		openModal(
			<CreateFavouriteListModal
				autoClose={false}
				onCreate={async (name: string) => {
					await handleCreateFavouriteList(name);
					openModal(<FavouritePickerModal accommodationId={accommodationId} onAdd={onAdd} onRemove={onRemove} />);
				}}
			/>
		);
	};

	return (
		<>
			<Stack direction={"row"} justifyContent={"space-between"}>
				<DialogTitle>Save to...</DialogTitle>
				<Button onClick={handleCreateNew}>Create new</Button>
			</Stack>
			<DialogContent dividers>
				<List>
					{localLists.map((list) => {
						const checked = list.items.some((i) => i.accommodationId === accommodationId);
						return (
							<ListItem key={list.id} disablePadding component="div" onClick={() => handleToggle(list.id)} sx={{ cursor: "pointer" }}>
								<ListItemIcon>
									<Checkbox checked={checked} tabIndex={-1} disableRipple />
								</ListItemIcon>
								<ListItemText primary={list.name} />
							</ListItem>
						);
					})}
				</List>
			</DialogContent>
			<DialogActions>
				<Button onClick={closeModal} disabled={loading}>
					Close
				</Button>
				<Button onClick={handleApply} variant="contained" disabled={loading}>
					Apply
				</Button>
			</DialogActions>

			{loading && (
				<div
					style={{
						position: "absolute",
						inset: 0,
						background: "rgba(255,255,255,0.6)",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<CircularProgress size={30} />
				</div>
			)}
		</>
	);
};

export default FavouritePickerModal;
