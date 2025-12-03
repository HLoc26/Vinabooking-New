import React from "react";
import { Grid, Card, CardContent, Skeleton } from "@mui/material";

interface Props {
	viewMode: "grid" | "list";
}

export const ResultsSkeleton: React.FC<Props> = ({ viewMode }) => {
	const items = [1, 2, 3, 4, 5, 6];

	return (
		<Grid container spacing={3}>
			{items.map((item) => (
				<Grid key={item} size={{ xs: 12, sm: viewMode === "grid" ? 6 : 12, md: viewMode === "grid" ? 4 : 12 }}>
					<Card>
						<Skeleton variant="rectangular" height={viewMode === "grid" ? 220 : 180} />
						<CardContent>
							<Skeleton variant="text" height={32} />
							<Skeleton variant="text" />
							<Skeleton variant="text" width="60%" />
						</CardContent>
					</Card>
				</Grid>
			))}
		</Grid>
	);
};
