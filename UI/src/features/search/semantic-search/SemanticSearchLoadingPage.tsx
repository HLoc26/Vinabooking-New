import React, { useEffect, useState } from "react";
import { Box, Typography, Container, LinearProgress, Paper } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useLocation, useNavigate } from "react-router-dom";
import type { SemanticSearchParams, SemanticSearchMatch } from "./types";
import apiClient from "../../../services/apiClient";
import { useScrollToTopOnMount } from "../../../hooks/useScrollToTopMount";

const STAGES = [
	{ label: "Encoding your query", sublabel: "Converting text to vector embeddings...", pct: 15 },
	{ label: "Scanning vector space", sublabel: "Searching hotel embeddings...", pct: 45 },
	{ label: "Ranking by relevance", sublabel: "Scoring semantic similarity...", pct: 75 },
	{ label: "Finalising", sublabel: "Preparing your personalized results...", pct: 95 },
];

export const SemanticSearchLoadingPage: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	useScrollToTopOnMount();

	const { params } = (location.state || {}) as { params: SemanticSearchParams };

	const [stageIdx, setStageIdx] = useState(0);
	const [displayPct, setDisplayPct] = useState(0);

	// Stage advancement simulation
	useEffect(() => {
		const stageDurations = [1500, 2000, 1500, 1000];
		let current = 0;
		const advance = () => {
			if (current >= STAGES.length - 1) return;
			current++;
			setStageIdx(current);
		};
		const timers: ReturnType<typeof setTimeout>[] = [];
		let cumulative = 0;
		stageDurations.forEach((d, i) => {
			cumulative += d;
			if (i < stageDurations.length - 1) {
				timers.push(setTimeout(advance, cumulative));
			}
		});
		return () => timers.forEach(clearTimeout);
	}, []);

	// Smooth progress bar
	useEffect(() => {
		const target = STAGES[stageIdx].pct;
		const interval = setInterval(() => {
			setDisplayPct((prev) => {
				const diff = target - prev;
				if (Math.abs(diff) < 0.5) return target;
				return prev + diff * 0.1;
			});
		}, 50);
		return () => clearInterval(interval);
	}, [stageIdx]);

	// Actual API Call
	useEffect(() => {
		if (!params) {
			navigate("/search/semantic");
			return;
		}

		const doSearch = async () => {
			const startTime = Date.now();
			try {
				const res = await apiClient.get("/search/semantic", {
					params: { q: params.query, l: params.city },
				});
				const data: SemanticSearchMatch[] = res.data.data;
				const took_ms = Date.now() - startTime;

				// Ensure at least 4s of animation for the premium feel
				const waitTime = Math.max(0, 4500 - took_ms);
				await new Promise((r) => setTimeout(r, waitTime));

				navigate("/search/semantic/results", { state: { results: data, params, took_ms } });
			} catch (error) {
				console.error("Semantic search failed:", error);
				const took_ms = Date.now() - startTime;
				const waitTime = Math.max(0, 4500 - took_ms);
				await new Promise((r) => setTimeout(r, waitTime));
				navigate("/search/semantic/results", { state: { results: null, params, took_ms } });
			}
		};
		doSearch();
	}, [navigate, params]);

	const stage = STAGES[stageIdx];

	return (
		<Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
			<Container maxWidth="sm">
				<Paper elevation={4} sx={{ p: 5, borderRadius: 4, textAlign: "center", position: "relative", overflow: "hidden" }}>
					<Box sx={{ mb: 4, position: "relative", display: "inline-flex" }}>
						<AutoAwesomeIcon sx={{ fontSize: 64, color: "primary.main", animation: "pulse 2s infinite ease-in-out" }} />
						<Box
							sx={{
								position: "absolute",
								top: "50%",
								left: "50%",
								width: 100,
								height: 100,
								transform: "translate(-50%, -50%)",
								borderRadius: "50%",
								border: "2px dashed",
								borderColor: "primary.light",
								animation: "spin 4s linear infinite",
							}}
						/>
						<Box
							sx={{
								position: "absolute",
								top: "50%",
								left: "50%",
								width: 120,
								height: 120,
								transform: "translate(-50%, -50%)",
								borderRadius: "50%",
								border: "1px dashed",
								borderColor: "secondary.light",
								animation: "spin 8s linear infinite reverse",
							}}
						/>
					</Box>

					<Typography variant="h5" fontWeight={800} mb={1}>
						{stage.label}
					</Typography>
					<Typography variant="body2" color="text.secondary" mb={4}>
						{stage.sublabel}
					</Typography>

					<Box sx={{ position: "relative", mb: 2 }}>
						<LinearProgress variant="determinate" value={displayPct} sx={{ height: 8, borderRadius: 4, bgcolor: "grey.200", "& .MuiLinearProgress-bar": { borderRadius: 4 } }} />
					</Box>
					<Typography variant="caption" fontWeight={700} color="primary.main">
						{Math.round(displayPct)}%
					</Typography>
				</Paper>

				<style>
					{`
            @keyframes pulse {
              0% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.1); opacity: 1; }
              100% { transform: scale(1); opacity: 0.8; }
            }
            @keyframes spin {
              100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
          `}
				</style>
			</Container>
		</Box>
	);
};
