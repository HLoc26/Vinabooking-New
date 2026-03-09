import React from "react";
import { Container, Box, Typography, Accordion, AccordionSummary, AccordionDetails, Stack } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SectionLabel from "../SectionLabel";

const faqs = [
	{ q: "Is it free to list my property?", a: "Yes, creating a listing is completely free. We only charge a small commission when you receive a confirmed booking - no upfront costs, ever." },
	{ q: "How do I get paid?", a: "We transfer your earnings directly to your registered bank account after each guest checks out. Fast, reliable, and transparent." },
	{ q: "Can I choose who stays at my property?", a: "Absolutely. You set the requirements, approve requests, and define your house rules. Your property, your terms." },
];

const FaqSection: React.FC = () => {
	return (
		<Container maxWidth="md" sx={{ py: { xs: 10, md: 14 } }}>
			<Box textAlign="center" mb={7}>
				<SectionLabel>Got questions?</SectionLabel>
				<Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
					Common answers
				</Typography>
			</Box>
			{faqs.map((faq, idx) => (
				<Accordion key={idx} disableGutters elevation={0}>
					<AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "primary.main" }} />} sx={{ py: 1 }}>
						<Stack direction="row" alignItems="center" spacing={2}>
							<Typography sx={{ color: "primary.main", fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 700 }}>0{idx + 1}</Typography>
							<Typography sx={{ fontWeight: 600, fontFamily: "'Sora', sans-serif" }}>{faq.q}</Typography>
						</Stack>
					</AccordionSummary>
					<AccordionDetails>
						<Typography sx={{ color: "text.secondary", lineHeight: 1.8, pl: 5 }}>{faq.a}</Typography>
					</AccordionDetails>
				</Accordion>
			))}
		</Container>
	);
};

export default FaqSection;
