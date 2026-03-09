import { useEffect, useState } from "react";
import FavouriteDetailView from "./FavouriteDetailView";
import { Box, Button, Grid, Skeleton, Stack, Typography } from "@mui/material";
import FolderCard from "./FolderCard";
import useUserFavouriteList from "../../../../../features/user/hooks/useUserFavouriteList";
import type { FavouriteList } from "../../../types/FavouriteList";
import { CreateNewFolderOutlined } from "@mui/icons-material";
import CreateFavouriteListModal from "./CreateFavouriteListModal";
import useModalContext from "../../../../../context/ModalContext/hook";

const FavouritesTabSkeleton = (
	<Box sx={{ p: 4, bgcolor: "white", minHeight: "100vh" }}>
		<Box sx={{ maxWidth: 1200, mx: "auto" }}>
			<Box mb={4} pb={2} borderBottom="1px solid #e5e7eb">
				<Typography variant="h5" fontWeight={700}>
					<Skeleton variant="text" width={200} />
				</Typography>
				<Typography variant="body2" color="text.secondary">
					<Skeleton variant="text" width={100} />
				</Typography>
			</Box>

			<Grid container spacing={2}>
				{Array.from({ length: 4 }).map((_, idx) => (
					<Grid size={{ xs: 6, sm: 4, md: 3, lg: 3 }} key={idx}>
						<Skeleton variant="rectangular" height={200} />
					</Grid>
				))}
			</Grid>
		</Box>
	</Box>
);

const FavouritesTab: React.FC = () => {
	const [selected, setSelected] = useState<FavouriteList | null>(null);

	const { favouriteLists, loading: favListLoading, handleCreateFavouriteList, handleDeleteFavouriteList, handleRemoveFromFavourite, handleUpdateFavouriteList } = useUserFavouriteList();

	const { openModal } = useModalContext();

	useEffect(() => {
		if (selected) {
			const updatedSelected = favouriteLists.find((f) => f.id === selected.id);
			setSelected(updatedSelected || null);
		}
	}, [favouriteLists, selected]);

	const handleOpenCreateModal = () => {
		openModal(<CreateFavouriteListModal onCreate={(name: string) => handleCreateFavouriteList(name)} loading={favListLoading} />);
	};

	if (!favouriteLists) {
		return FavouritesTabSkeleton;
	}

	if (selected) {
		return <FavouriteDetailView favourite={selected} onBack={() => setSelected(null)} handleRemoveFromFavourite={handleRemoveFromFavourite} handleUpdateFavourite={handleUpdateFavouriteList} />;
	}

	return (
		<Box sx={{ p: 4, bgcolor: "white", minHeight: "75vh" }}>
			<Box sx={{ maxWidth: 1200, mx: "auto" }}>
				<Box mb={4} pb={2} borderBottom="1px solid #e5e7eb" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
					<Box>
						<Typography variant="h5" fontWeight={700}>
							Favourite Lists
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{favouriteLists.length} lists
						</Typography>
					</Box>

					<Button variant="contained" size="small" onClick={() => handleOpenCreateModal()}>
						<Stack direction={"row"} spacing={1} alignItems={"center"}>
							<CreateNewFolderOutlined />
							<Typography variant="subtitle2">New List</Typography>
						</Stack>
					</Button>
				</Box>

				<Grid container spacing={2}>
					{favouriteLists.map((f) => (
						<Grid size={{ xs: 6, sm: 4, md: 3, lg: 3 }} key={f.id}>
							<FolderCard favourite={f} onClick={() => setSelected(f)} onDelete={handleDeleteFavouriteList} />
						</Grid>
					))}
				</Grid>
			</Box>
		</Box>
	);
};

export default FavouritesTab;
