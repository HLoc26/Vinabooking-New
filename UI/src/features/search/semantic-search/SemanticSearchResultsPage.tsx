import React from "react";
import { Box, Typography, Button, Container, Grid, Alert, Paper, Chip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useLocation, useNavigate } from "react-router-dom";
import type { SemanticSearchParams, SemanticSearchMatch } from "./types";
import { AccommodationCard } from "../../accommodation/components/search/AccommodationCard";
import { useScrollToTopOnMount } from "../../../hooks/useScrollToTopMount";

export const SemanticSearchResultsPage: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	useScrollToTopOnMount();

	const { results, params, took_ms } = (location.state || {}) as {
		results: SemanticSearchMatch[] | null;
		params: SemanticSearchParams;
		took_ms: number;
	};

	const matches = results ?? [];
	const hasError = results === null;
	const hasResults = matches.length > 0;

	return (
		<Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 8 }}>
			{/* Header Area */}
			<Paper elevation={1} sx={{ position: "sticky", top: { xs: 56, md: 64 }, zIndex: 10, borderRadius: 0, borderBottom: 1, borderColor: "divider", py: 2 }}>
				<Container maxWidth="xl">
					<Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
						<Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/search/semantic")} color="inherit" sx={{ textTransform: "none", fontWeight: 600 }}>
							Refine search
						</Button>

						<Box sx={{ width: "1px", height: 24, bgcolor: "divider" }} />

						<Box flex={1} overflow="hidden">
							{params?.query && (
								<Typography variant="body2" color="text.secondary" noWrap>
									<Box component="span" fontWeight={600} color="text.primary">
										"{params.query}"
									</Box>
								</Typography>
							)}
						</Box>

						{took_ms && (
							<Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
								<AccessTimeIcon fontSize="small" />
								<Typography variant="caption">{(took_ms / 1000).toFixed(2)}s</Typography>
							</Box>
						)}
					</Box>
				</Container>
			</Paper>

			{/* Main Content */}
			<Container maxWidth="xl" sx={{ pt: 4 }}>
				<Box mb={4} display="flex" alignItems="center" gap={2}>
					<AutoAwesomeIcon color="secondary" fontSize="large" />
					<Typography variant="h4" fontWeight={800}>
						AI Search Results
					</Typography>
					{hasResults && <Chip label={`${matches.length} matches`} color="secondary" variant="outlined" size="small" sx={{ fontWeight: 600 }} />}
				</Box>

				{hasError && (
					<Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
						Something went wrong while searching. Please try again.
					</Alert>
				)}

				{!hasError && !hasResults && (
					<Paper elevation={0} sx={{ textAlign: "center", py: 10, borderRadius: 4, border: "1px dashed", borderColor: "divider", bgcolor: "transparent" }}>
						<SearchIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
						<Typography variant="h6" fontWeight={700} color="text.primary" mb={1}>
							No matches found
						</Typography>
						<Typography variant="body2" color="text.secondary" mb={4}>
							Try rephrasing your description or searching a different city.
						</Typography>
						<Button variant="contained" color="primary" onClick={() => navigate("/search/semantic")} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
							New Search
						</Button>
					</Paper>
				)}
				{hasResults && (
					<Grid container spacing={3}>
						{matches.map((match) => (
							<Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={match.accommodation.id}>
								<Box height="100%">
									<AccommodationCard
										accommodation={match.accommodation}
										variant="grid"
										score={match.aiMatchStats?.finalScore}
										matchReason={match.aiMatchStats?.matchReason}
										onClick={(id) => window.open(`/accommodation/${id}`, "_blank")}
									/>
								</Box>
							</Grid>
						))}
					</Grid>
				)}
			</Container>
		</Box>
	);
};
