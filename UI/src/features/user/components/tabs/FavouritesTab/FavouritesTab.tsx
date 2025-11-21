import { useState } from "react";
import FavouriteDetailView from "./FavouriteDetailView";
import { Box, Grid, Skeleton, Typography } from "@mui/material";
import FolderCard from "./FolderCard";
import useUserFavouriteList from "../../../hooks/useUserFavouriteList";
import useUserProfileInfo from "../../../../../hooks/useUserProfileInfo";
import type { FavouriteList } from "../../../types/FavouriteList";

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

	const { userInfo } = useUserProfileInfo();

	const { favouriteLists } = useUserFavouriteList(userInfo?.id ?? "");

	if (!favouriteLists) {
		return FavouritesTabSkeleton;
	}

	if (selected) {
		return <FavouriteDetailView favourite={selected} onBack={() => setSelected(null)} />;
	}

	return (
		<Box sx={{ p: 4, bgcolor: "white", minHeight: "100vh" }}>
			<Box sx={{ maxWidth: 1200, mx: "auto" }}>
				<Box mb={4} pb={2} borderBottom="1px solid #e5e7eb">
					<Typography variant="h5" fontWeight={700}>
						Favourite Lists
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{favouriteLists.length} lists
					</Typography>
				</Box>

				<Grid container spacing={2}>
					{favouriteLists.map((f) => (
						<Grid size={{ xs: 6, sm: 4, md: 3, lg: 3 }} key={f.id}>
							<FolderCard favourite={f} onClick={() => setSelected(f)} />
						</Grid>
					))}
				</Grid>
			</Box>
		</Box>
	);
};

export default FavouritesTab;
