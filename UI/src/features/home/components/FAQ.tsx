import React, { useState } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Container, Box } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { FAQS } from "../constants/FAQConst";

const FAQ: React.FC = () => {
	const [openId, setOpenId] = useState<string | null>(null);

	const toggleFAQ = (id: string) => setOpenId(openId === id ? null : id);

	return (
		<Box
			sx={{
				pt: 10,
				position: "relative",
				overflow: "hidden",
				"&::before": {
					content: '""',
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					height: "1px",
					background: "linear-gradient(90deg, transparent 0%, #FB923C 30%, #FDE68A 70%, transparent 100%)",
					opacity: 0.4,
				},
			}}
		>
			<Container maxWidth="md">
				{/* Header */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: 1.5,
						mb: 7,
					}}
				>
					<Box
						sx={{
							width: 48,
							height: 48,
							borderRadius: "14px",
							background: "linear-gradient(135deg, #FFF7ED, #FFEDD5)",
							border: "1.5px solid #FDBA74",
							boxShadow: "0 2px 12px rgba(251,146,60,0.15)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<HelpOutlineIcon sx={{ fontSize: 24, color: "#F97316" }} />
					</Box>
					<Typography
						variant="h4"
						sx={{
							fontFamily: "'Sora', sans-serif",
							fontWeight: 800,
							color: "text.primary",
							letterSpacing: "-0.02em",
						}}
					>
						Frequently Asked Questions
					</Typography>
				</Box>

				{/* Accordion list */}
				{FAQS.map((item) => {
					const isOpen = openId === item.id;
					return (
						<Accordion
							key={item.id}
							expanded={isOpen}
							onChange={() => toggleFAQ(item.id)}
							disableGutters
							elevation={0}
							sx={{
								mb: 1.5,
								borderRadius: "16px !important",
								overflow: "hidden",
								border: isOpen ? "1.5px solid #FDBA74" : "1.5px solid #F3E8D8",
								bgcolor: isOpen ? "#FFFBF5" : "#FFFFFF",
								boxShadow: isOpen ? "0 4px 24px rgba(249,115,22,0.10)" : "0 1px 4px rgba(0,0,0,0.05)",
								transition: "all 0.22s ease",
								"&:before": { display: "none" },
								"&:hover": {
									border: "1.5px solid #FDBA74",
									boxShadow: "0 4px 16px rgba(249,115,22,0.08)",
								},
							}}
						>
							<AccordionSummary expandIcon={isOpen ? <ExpandLessIcon sx={{ color: "#F97316" }} /> : <ExpandMoreIcon sx={{ color: "#9CA3AF" }} />} sx={{ px: 3, py: 1.75 }}>
								<Typography
									variant="subtitle1"
									sx={{
										fontFamily: "'Sora', sans-serif",
										fontWeight: 600,
										color: isOpen ? "#EA580C" : "text.primary",
										transition: "color 0.2s",
										letterSpacing: "-0.01em",
									}}
								>
									{item.question}
								</Typography>
							</AccordionSummary>

							<AccordionDetails
								sx={{
									px: 3,
									pt: 0,
									pb: 2.5,
									borderTop: "1px solid #FEF3E7",
								}}
							>
								<Typography
									variant="body1"
									sx={{
										color: "text.secondary",
										fontFamily: "'DM Sans', sans-serif",
										lineHeight: 1.75,
									}}
								>
									{item.answer}
								</Typography>
							</AccordionDetails>
						</Accordion>
					);
				})}
			</Container>
		</Box>
	);
};

export default FAQ;
