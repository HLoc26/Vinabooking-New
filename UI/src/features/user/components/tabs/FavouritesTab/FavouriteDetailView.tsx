import { ArrowBack, CalendarMonth, Edit, StarRounded } from "@mui/icons-material";
import { Box, Grid, IconButton, Input, Pagination, Paper, Skeleton, Typography } from "@mui/material";
import AccommodationCard from "./AccommodationCard";
import { useEffect, useMemo, useState } from "react";
import { formatDate } from "../../../../../utils/dateFormatter";
import type { FavouriteList } from "../../../../../types/FavouriteList";
import useAccommodationsBatch from "../../../../accommodation/hooks/useAccommodationsBatch";

type FavouriteDetailViewProps = {
	favourite: FavouriteList;
	onBack: () => void;
	handleRemoveFromFavourite: (favouriteId: string, accommodationId: string) => void;
	handleUpdateFavourite: (favouriteId: string, name: string) => void;
};

const FavouriteDetailView: React.FC<FavouriteDetailViewProps> = ({ favourite, onBack, handleRemoveFromFavourite, handleUpdateFavourite }) => {
	const [page, setPage] = useState(1);
	const itemsPerPage = 8;
	const [isEditing, setIsEditing] = useState(false);
	const [name, setName] = useState(favourite.name);

	useEffect(() => {
		setName(favourite.name);
	}, [favourite.name]);

	const accommodationIds = useMemo(() => favourite.items.map((i) => i.accommodationId), [favourite.items]);

	const { data: accommodation } = useAccommodationsBatch(accommodationIds);

	const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value);
	};

	const handleUpdate = () => {
		setIsEditing(false);
		if (name === favourite.name || name === "") return;
		handleUpdateFavourite(favourite.id, name);
	};

	if (!accommodation) {
		return (
			<Box sx={{ p: 4, bgcolor: "grey.50", minHeight: "100vh" }}>
				<Box sx={{ maxWidth: 1200, mx: "auto" }}>
					<Box sx={{ display: "flex", alignItems: "center", mb: 3, cursor: "pointer" }} onClick={onBack}>
						<ArrowBack sx={{ mr: 1 }} />
						<Typography fontWeight={600}>Back to list</Typography>
					</Box>

					<Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
						<Typography variant="h4" fontWeight={700} mb={1}>
							<Skeleton variant="text" />
						</Typography>

						<Box sx={{ display: "flex", gap: 3, color: "text.secondary" }}>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Skeleton variant="text" width={200} />
							</Box>
						</Box>
					</Paper>

					<Grid container spacing={3}>
						{Array.from({ length: 3 }).map((_, idx) => (
							<Grid key={idx}>
								<Skeleton variant="rectangular" height={200} />
							</Grid>
						))}
					</Grid>
				</Box>
			</Box>
		);
	}

	const totalPages = Math.ceil(accommodation.length / itemsPerPage);
	const slice = accommodation.slice((page - 1) * itemsPerPage, page * itemsPerPage);

	return (
		<Box sx={{ p: 4, bgcolor: "grey.50", minHeight: "100vh" }}>
			<Box sx={{ maxWidth: 1200, mx: "auto" }}>
				<Box sx={{ display: "flex", alignItems: "center", mb: 3, cursor: "pointer" }} onClick={onBack}>
					<ArrowBack sx={{ mr: 1 }} />
					<Typography fontWeight={600}>Back to list</Typography>
				</Box>

				<Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						{isEditing ? (
							<Input
								value={name}
								onChange={handleNameChange}
								onBlur={handleUpdate}
								onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
								autoFocus
								sx={{
									typography: "h4",
									fontWeight: 700,
									mb: 1,
								}}
							/>
						) : (
							<>
								<Typography variant="h4" fontWeight={700} mb={1}>
									{favourite.name}
								</Typography>
								<IconButton onClick={() => setIsEditing(true)} sx={{ mb: 1, ml: 1 }}>
									<Edit />
								</IconButton>
							</>
						)}
					</Box>

					<Box sx={{ display: "flex", gap: 3, color: "text.secondary" }}>
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<StarRounded sx={{ mr: 1, color: "gold" }} />
							{favourite.items.length} accommodations
						</Box>
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<CalendarMonth sx={{ mr: 1 }} />
							Updated: {formatDate(favourite.updatedAt.toString())}
						</Box>
					</Box>
				</Paper>

				<Grid container spacing={3}>
					{slice.map((ac) => (
						<Grid key={ac.id}>
							<AccommodationCard accommodation={ac} onRemove={(accommodationId: string) => handleRemoveFromFavourite(favourite.id, accommodationId)} />
						</Grid>
					))}
				</Grid>

				{totalPages > 1 && (
					<Box mt={4} display="flex" justifyContent="center">
						<Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
					</Box>
				)}
			</Box>
		</Box>
	);
};

export default FavouriteDetailView;
