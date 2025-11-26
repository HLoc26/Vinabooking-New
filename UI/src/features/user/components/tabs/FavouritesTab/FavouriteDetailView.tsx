import { ArrowBack, CalendarMonth, StarRounded } from "@mui/icons-material";
import { Box, Grid, Pagination, Paper, Skeleton, Typography } from "@mui/material";
import AccommodationCard from "./AccommodationCard";
import { useMemo, useState } from "react";
import { formatDate } from "../../../../../utils/dateFormatter";
import type { FavouriteList } from "../../../../../types/FavouriteList";
import useBatchAccommodationInfo from "../../../hooks/useBatchAccommodationInfo";

type FavouriteDetailViewProps = {
	favourite: FavouriteList;
	onBack: () => void;
};

const FavouriteDetailView: React.FC<FavouriteDetailViewProps> = ({ favourite, onBack }) => {
	const [page, setPage] = useState(1);
	const itemsPerPage = 8;

	const accommodationIds = useMemo(() => favourite.items.map((i) => i.accommodationId), [favourite.items]);
	console.log("Rerender");

	const accommodation = useBatchAccommodationInfo(accommodationIds);

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
							<Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
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
					<Typography variant="h4" fontWeight={700} mb={1}>
						{favourite.name}
					</Typography>

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
						<Grid size={{ xs: 12, sm: 6, md: 4 }} key={ac.id}>
							<AccommodationCard accommodation={ac} />
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
