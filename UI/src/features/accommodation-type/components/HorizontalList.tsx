import React, { useRef } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface HorizontalListProps<T> {
	title: string;
	items: T[];
	renderItem: (item: T) => React.ReactNode;
	onSeeAll?: () => void;
}

const HorizontalList = <T,>({ title, items, renderItem, onSeeAll }: HorizontalListProps<T>) => {
	const scrollRef = useRef<HTMLDivElement>(null);

	// Mouse dragging logic
	const isDown = useRef(false);
	const startX = useRef(0);
	const scrollLeft = useRef(0);

	const handleMouseDown = (e: React.MouseEvent) => {
		isDown.current = true;
		startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
		scrollLeft.current = scrollRef.current?.scrollLeft || 0;
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDown.current || !scrollRef.current) return;
		e.preventDefault();
		const x = e.pageX - scrollRef.current.offsetLeft;
		const walk = (x - startX.current) * 1.5; // Drag speed multiplier
		scrollRef.current.scrollLeft = scrollLeft.current - walk;
	};

	const handleMouseUp = () => (isDown.current = false);
	const handleMouseLeave = () => (isDown.current = false);

	// Scroll arrows
	const scrollByAmount = (amount: number) => {
		if (scrollRef.current) {
			scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
		}
	};

	return (
		<Box sx={{ position: "relative", py: { xs: 4, md: 6 } }}>
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
						endIcon={<ArrowRight size={18} />}
						sx={{
							textTransform: "none",
							color: "secondary.main",
							fontWeight: 600,
							"&:hover": { color: "secondary.dark", bgcolor: "transparent" },
						}}
					>
						See all
					</Button>
				)}
			</Box>

			{/* Scroll Container Wrapper for Arrows */}
			<Box sx={{ position: "relative" }}>
				{/* Left Arrow */}
				<IconButton
					onClick={() => scrollByAmount(-300)}
					size="small"
					sx={{
						position: "absolute",
						left: 8,
						top: "50%",
						transform: "translateY(-50%)",
						zIndex: 5,
						display: { xs: "none", md: "flex" },
						bgcolor: "background.paper",
						boxShadow: 3,
						"&:hover": { bgcolor: "grey.100" },
					}}
				>
					<ArrowLeft size={20} />
				</IconButton>

				{/* Scrollable content */}
				<Box
					ref={scrollRef}
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					onMouseLeave={handleMouseLeave}
					className="no-scrollbar"
					sx={{
						display: "flex",
						overflowX: "auto",
						gap: 3,
						px: 2,
						pb: 2,
						scrollBehavior: "smooth",
						cursor: "grab",
						"&:active": { cursor: "grabbing" },
					}}
				>
					{items.map((item, index) => (
						<Box key={index} sx={{ flex: "0 0 auto", width: { xs: "85%", sm: "45%", md: "30%", lg: "22%" } }}>
							{renderItem(item)}
						</Box>
					))}
				</Box>

				{/* Right Arrow */}
				<IconButton
					onClick={() => scrollByAmount(300)}
					size="small"
					sx={{
						position: "absolute",
						right: 8,
						top: "50%",
						transform: "translateY(-50%)",
						zIndex: 5,
						display: { xs: "none", md: "flex" },
						bgcolor: "background.paper",
						boxShadow: 3,
						"&:hover": { bgcolor: "grey.100" },
					}}
				>
					<ArrowRight size={20} />
				</IconButton>
			</Box>
		</Box>
	);
};

export default HorizontalList;
