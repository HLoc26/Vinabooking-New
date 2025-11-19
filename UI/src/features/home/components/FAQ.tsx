import React, { useState } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Container, Box } from "@mui/material";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { FAQS } from "../constants/FAQConst";

interface FAQProps {
	items: Array<(typeof FAQS)[number]>;
}

const FAQ: React.FC<FAQProps> = ({ items }) => {
	const [openId, setOpenId] = useState<string | null>(null);

	const toggleFAQ = (id: string) => {
		setOpenId(openId === id ? null : id);
	};

	return (
		<Box sx={{ py: 8, bgcolor: "white" }}>
			<Container maxWidth="md">
				{/* Header */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						mb: 5,
					}}
				>
					<HelpCircle size={32} color="#f97316" style={{ marginRight: 12 }} />
					<Typography variant="h4" fontWeight="bold" color="text.primary">
						Frequently Asked Questions
					</Typography>
				</Box>

				{/* Accordion List */}
				{items.map((item) => {
					const isOpen = openId === item.id;

					return (
						<Accordion
							key={item.id}
							expanded={isOpen}
							onChange={() => toggleFAQ(item.id)}
							sx={{
								mb: 2,
								borderRadius: 3,
								overflow: "hidden",
								boxShadow: isOpen ? 4 : 1,
								border: isOpen ? "1px solid #fdba74" : "1px solid #e5e7eb",
								bgcolor: isOpen ? "rgba(251,146,60,0.1)" : "white",
								"&:before": { display: "none" }, // remove accordion line
							}}
						>
							<AccordionSummary
								expandIcon={isOpen ? <ChevronUp color="#f97316" /> : <ChevronDown color="#9ca3af" />}
								sx={{
									px: 3,
									py: 2,
								}}
							>
								<Typography variant="subtitle1" fontWeight={600} color={isOpen ? "orange" : "text.primary"}>
									{item.question}
								</Typography>
							</AccordionSummary>

							<AccordionDetails
								sx={{
									px: 3,
									pt: 0,
									pb: 2,
									color: "text.secondary",
									borderTop: "1px solid rgba(0,0,0,0.05)",
								}}
							>
								<Typography variant="body1" lineHeight={1.6}>
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
