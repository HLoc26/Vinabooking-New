import React from "react";
import { Box, Typography } from "@mui/material";
import { ACCOMMODATION_LABELS, ACCOMMODATION_QUOTES, ACCOMMODATION_HERO_IMAGES } from "../constants/Const";
import SearchBar from "../../accommodation/components/search/SearchBar/SearchBar";
import { EAccommodationType } from "../../accommodation/types/accommodation.types";

interface HeroProps {
	currentType: EAccommodationType;
	onTypeChange: (type: EAccommodationType) => void;
}

export const Hero: React.FC<HeroProps> = ({ currentType }) => {
	return (
		<Box
			position="relative"
			sx={{
				minHeight: { xs: 660, lg: 760 },
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
			}}
		>
			{/* ── Background images with smooth crossfade ── */}
			{Object.values(EAccommodationType).map((type) => (
				<Box
					key={type}
					position="absolute"
					sx={{
						inset: 0,
						backgroundImage: `url(${ACCOMMODATION_HERO_IMAGES[type]})`,
						backgroundSize: "cover",
						backgroundPosition: "center",
						zIndex: 0,
						opacity: currentType === type ? 1 : 0,
						transition: "opacity 1.4s cubic-bezier(0.4, 0, 0.2, 1)",
						...(currentType === type && {
							animation: "kenburns 14s ease-in-out infinite alternate",
						}),
					}}
				/>
			))}

			<style>{`
				@keyframes kenburns {
					from { transform: scale(1); }
					to   { transform: scale(1.05); }
				}
				@keyframes drawLine {
					from { stroke-dashoffset: 240; }
					to   { stroke-dashoffset: 0; }
				}
				@keyframes fadeUp {
					from { opacity: 0; transform: translateY(16px); }
					to   { opacity: 1; transform: translateY(0); }
				}
			`}</style>

			{/* ── Warm gradient overlay ── */}
			<Box
				position="absolute"
				sx={{
					inset: 0,
					background: "linear-gradient(to bottom, " + "rgba(30,10,0,0.45) 0%, " + "rgba(30,10,0,0.3)  45%, " + "rgba(30,10,0,0.65) 85%, " + "rgba(30,10,0,0.85) 100%)",
					zIndex: 1,
				}}
			/>

			{/* ── Soft warm vignette at top ── */}
			<Box
				position="absolute"
				sx={{
					top: 0,
					left: 0,
					right: 0,
					height: "30%",
					background: "linear-gradient(to bottom, rgba(251,146,60,0.08), transparent)",
					zIndex: 2,
					pointerEvents: "none",
				}}
			/>

			{/* ── Text content ── */}
			<Box position="relative" zIndex={5} textAlign="center" px={2} mt={{ xs: 10, md: 13 }} maxWidth={940} mx="auto" pb={7} sx={{ animation: "fadeUp 0.7s ease both" }}>
				{/* Eyebrow pill */}
				<Box
					sx={{
						display: "inline-flex",
						alignItems: "center",
						gap: 1,
						px: 2,
						py: 0.65,
						mb: 1,
						borderRadius: "100px",
						border: "1px solid rgba(251,146,60,0.55)",
						bgcolor: "rgba(132, 77, 32, 0.75)",
						backdropFilter: "blur(10px)",
					}}
				>
					<Box
						component="span"
						sx={{
							width: 7,
							height: 7,
							borderRadius: "50%",
							bgcolor: "#FB923C",
							display: "inline-block",
							animation: "pulse 2.4s ease-in-out infinite",
						}}
					/>
					<style>{`
						@keyframes pulse {
							0%,100% { opacity:1; transform:scale(1); }
							50%      { opacity:0.45; transform:scale(1.5); }
						}
					`}</style>
					<Typography
						variant="caption"
						sx={{
							color: "#ffdfbdff",
							fontFamily: "'Sora', sans-serif",
							fontWeight: 700,
							letterSpacing: "0.14em",
							textTransform: "uppercase",
							fontSize: "0.68rem",
						}}
					>
						VinaBooking
					</Typography>
				</Box>

				{/* Main heading */}
				<Typography
					variant="h2"
					fontWeight={800}
					mb={2.5}
					sx={{
						fontFamily: "'Sora', sans-serif",
						color: "#FFFFFF",
						fontSize: { xs: "2.3rem", md: "3.5rem", lg: "4.1rem" },
						lineHeight: 1.08,
						letterSpacing: "-0.03em",
						textShadow: "0 2px 24px rgba(0,0,0,0.35)",
					}}
				>
					Find the perfect{" "}
					<Box
						component="span"
						sx={{
							position: "relative",
							display: "inline-block",
							color: "#FB923C",
						}}
					>
						{ACCOMMODATION_LABELS[currentType] ?? "Accommodation"}
						{/* Animated teal-to-orange underline */}
						<Box
							component="svg"
							viewBox="0 0 240 10"
							preserveAspectRatio="none"
							sx={{
								position: "absolute",
								bottom: -7,
								left: 0,
								width: "100%",
								height: 13,
								fill: "none",
								overflow: "visible",
							}}
						>
							<defs>
								<linearGradient id="uline" x1="0%" y1="0%" x2="100%" y2="0%">
									<stop offset="0%" stopColor="#FB923C" />
									<stop offset="100%" stopColor="#FDE68A" />
								</linearGradient>
							</defs>
							<path
								d="M2 7 C50 3, 160 1, 238 5"
								stroke="url(#uline)"
								strokeWidth="3.5"
								strokeLinecap="round"
								style={{
									strokeDasharray: 240,
									animation: "drawLine 0.9s 0.3s ease-out both",
								}}
							/>
						</Box>
					</Box>
				</Typography>

				{/* Subtitle */}
				<Typography
					variant="h6"
					sx={{
						color: "rgba(255, 255, 255, 1)",
						fontFamily: "'DM Sans', sans-serif",
						fontWeight: 700,
						fontSize: { xs: "1rem", md: "1.15rem" },
						maxWidth: 520,
						mx: "auto",
						lineHeight: 1.6,
					}}
				>
					{ACCOMMODATION_QUOTES[currentType]}
				</Typography>
			</Box>

			{/* ── Search bar ── */}
			<SearchBar />
		</Box>
	);
};
