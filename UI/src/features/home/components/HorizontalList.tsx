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
	const { goToType } = useAccommodationTypeNavigation();

	let isDown = false;
	let startX = 0;
	let scrollLeft = 0;

	const handleItemClick = (item: any) => goToType(item.name);

	const handleMouseDown = (e: React.MouseEvent) => {
		isDown = true;
		startX = e.pageX - (scrollRef.current?.offsetLeft || 0);
		scrollLeft = scrollRef.current?.scrollLeft || 0;
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDown || !scrollRef.current) return;
		e.preventDefault();
		const x = e.pageX - scrollRef.current.offsetLeft;
		scrollRef.current.scrollLeft = scrollLeft - (x - startX);
	};

	const handleMouseUp = () => (isDown = false);

	const scrollByAmount = (amount: number) => {
		scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
	};

	// Arrow button style — warm white with orange hover
	const arrowSx = {
		position: "absolute" as const,
		top: "50%",
		transform: "translateY(-50%)",
		zIndex: 5,
		display: { xs: "none", sm: "flex" },
		width: 42,
		height: 42,
		border: "1.5px solid #F3E8D8",
		color: "#6B7280",
		boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
		transition: "all 0.2s ease",
		bgcolor: "#FFF7ED",
		"&:hover": {
			bgcolor: "#FFF7ED",
			border: "1.5px solid #FDBA74",
			color: "#F97316",
			boxShadow: "0 4px 16px rgba(249,115,22,0.15)",
		},
	};

	return (
		<Box sx={{ position: "relative", pt: { xs: 4, md: 7 } }}>
			{/* Header */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-end",
					mb: 4,
					px: 2,
				}}
			>
				<Box>
					{/* Accent bar + eyebrow */}
					<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.75 }}>
						<Box
							sx={{
								width: 24,
								height: 3.5,
								borderRadius: 2,
								background: "linear-gradient(90deg, #F97316, #FDBA74)",
							}}
						/>
						<Typography
							variant="caption"
							sx={{
								color: "#F97316",
								fontFamily: "'Sora', sans-serif",
								fontWeight: 700,
								letterSpacing: "0.12em",
								textTransform: "uppercase",
								fontSize: "0.65rem",
							}}
						>
							Explore
						</Typography>
					</Box>

					<Typography
						variant="h5"
						sx={{
							fontFamily: "'Sora', sans-serif",
							fontWeight: 800,
							color: "text.primary",
							letterSpacing: "-0.02em",
						}}
					>
						{title}
					</Typography>
				</Box>

				{onSeeAll && (
					<Button
						onClick={onSeeAll}
						endIcon={<ArrowForwardIcon sx={{ fontSize: "1rem !important" }} />}
						sx={{
							fontFamily: "'Sora', sans-serif",
							fontWeight: 700,
							fontSize: "0.82rem",
							color: "#F97316",
							border: "1.5px solid #FDBA74",
							borderRadius: "100px",
							px: 2.25,
							py: 0.65,
							bgcolor: "#FFF7ED",
							"&:hover": {
								bgcolor: "#FFEDD5",
								border: "1.5px solid #F97316",
								boxShadow: "0 2px 10px rgba(249,115,22,0.15)",
							},
						}}
					>
						See all
					</Button>
				)}
			</Box>

			{/* Scroll container */}
			<Box sx={{ position: "relative" }}>
				<IconButton onClick={() => scrollByAmount(-320)} sx={{ ...arrowSx, left: -30 }}>
					<ArrowBackIcon fontSize="small" />
				</IconButton>
				<Box
					sx={{
						position: "relative",
						overflow: "hidden", // Đảm bảo mask không bị tràn
						maskImage: {
							xs: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
							md: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
						},
						WebkitMaskImage: {
							xs: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
							md: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
						},
					}}
				>
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
							<Box
								key={index}
								sx={{
									flex: "0 0 auto",
									width: { xs: "72%", sm: "42%", md: "31%", lg: "24%" },
								}}
							>
								{renderItem(item, () => handleItemClick(item))}
							</Box>
						))}
					</Box>
				</Box>
				<IconButton onClick={() => scrollByAmount(320)} sx={{ ...arrowSx, right: -30 }}>
					<ArrowForwardIcon fontSize="small" />
				</IconButton>
			</Box>
		</Box>
	);
};

export default HorizontalList;
