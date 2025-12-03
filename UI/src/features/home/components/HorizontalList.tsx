import React, { useRef } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import { useAccommodationTypeNavigation } from "../hooks/useAccommodationTypeNavigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface HorizontalListProps<T> {
	title: string;
	items: T[];
	renderItem: (item: T, onClick: () => void) => React.ReactNode;
	onSeeAll?: () => void;
	onItemClick?: (item: T) => void;
}

const HorizontalList = <T,>({ title, items, renderItem, onSeeAll }: HorizontalListProps<T>) => {
	const scrollRef = useRef<HTMLDivElement>(null);

	// Mouse dragging logic
	let isDown = false;
	let startX = 0;
	let scrollLeft = 0;
	const { goToType } = useAccommodationTypeNavigation();
	const handleItemClick = (item: any) => {
		// item.value = your enum key
		goToType(item.name);
	};

	const handleMouseDown = (e: React.MouseEvent) => {
		isDown = true;
		startX = e.pageX - (scrollRef.current?.offsetLeft || 0);
		scrollLeft = scrollRef.current?.scrollLeft || 0;
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDown || !scrollRef.current) return;
		e.preventDefault();
		const x = e.pageX - scrollRef.current.offsetLeft;
		const walk = (x - startX) * 1; // Drag speed
		scrollRef.current.scrollLeft = scrollLeft - walk;
	};
	const handleMouseUp = () => (isDown = false);

	// Scroll arrows
	const scrollByAmount = (amount: number) => {
		if (scrollRef.current) {
			scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
		}
	};

	return (
		<Box sx={{ position: "relative", py: { xs: 4, md: 8 } }}>
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
						endIcon={<ArrowForwardIcon />}
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

			{/* Scroll Container */}
			<Box sx={{ position: "relative" }}>
				{/* Left Arrow */}
				<IconButton
					onClick={() => scrollByAmount(-300)}
					sx={{
						position: "absolute",
						left: 0,
						top: "50%",
						transform: "translateY(-50%)",
						zIndex: 5,
						display: { xs: "none", sm: "flex" },
						bgcolor: "white",
						boxShadow: 2,
						":hover": { bgcolor: "grey.100" },
					}}
				>
					<ArrowBackIcon />
				</IconButton>

				{/* Scrollable content */}
				<Box
					ref={scrollRef}
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseLeave={handleMouseUp}
					onMouseUp={handleMouseUp}
					sx={{
						display: "flex",
						overflowX: "auto",
						gap: 2,
						px: 2,
						pb: 2,
						scrollBehavior: "smooth",
						cursor: "grab",
						"&:active": { cursor: "grabbing" },
						"&::-webkit-scrollbar": { display: "none" },
					}}
				>
					{items.map((item, index) => (
						<Box key={index} sx={{ flex: "0 0 auto", width: { xs: "70%", sm: "40%", md: "30%", lg: "25%" } }}>
							{renderItem(item, () => handleItemClick(item))}
						</Box>
					))}
				</Box>

				{/* Right Arrow */}
				<IconButton
					onClick={() => scrollByAmount(300)}
					sx={{
						position: "absolute",
						right: 0,
						top: "50%",
						transform: "translateY(-50%)",
						zIndex: 5,
						display: { xs: "none", sm: "flex" },
						bgcolor: "white",
						boxShadow: 2,
						":hover": { bgcolor: "grey.100" },
					}}
				>
					<ArrowForwardIcon />
				</IconButton>
			</Box>
		</Box>
	);
};
export default HorizontalList;
