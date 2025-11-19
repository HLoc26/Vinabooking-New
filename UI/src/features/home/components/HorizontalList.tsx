import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { ArrowRight } from "lucide-react";

interface HorizontalListProps<T> {
	title: string;
	items: T[];
	renderItem: (item: T) => React.ReactNode;
	onSeeAll?: () => void;
}

const HorizontalList = <T,>({ title, items, renderItem, onSeeAll }: HorizontalListProps<T>) => {
	return (
		<Box sx={{ py: { xs: 4, md: 8 } }}>
			{/* Header */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 3,
					px: 2,
				}}
			>
				<Typography variant="h5" fontWeight="bold" color="text.primary">
					{title}
				</Typography>
				{onSeeAll && (
					<Button
						onClick={onSeeAll}
						endIcon={<ArrowRight />}
						sx={{
							textTransform: "none",
							color: "orange.600",
							fontWeight: 500,
							"&:hover": { color: "orange.700", bgcolor: "transparent" },
						}}
					>
						See all
					</Button>
				)}
			</Box>

			{/* Horizontal Scroll */}
			<Box
				sx={{
					display: "flex",
					overflowX: "auto",
					gap: 2,
					px: 2,
					pb: 2,
					"&::-webkit-scrollbar": { display: "none" },
				}}
			>
				{items.map((item, index) => (
					<Box key={index} sx={{ flex: "0 0 auto", width: { xs: "70%", sm: "40%", md: "30%", lg: "22%" } }}>
						{renderItem(item)}
					</Box>
				))}
			</Box>
		</Box>
	);
};

export default HorizontalList;
