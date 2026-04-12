import { Box, Typography, Paper, Container, Accordion, AccordionSummary, AccordionDetails, Divider } from "@mui/material";
import { useState, useEffect } from "react";
import type { WizardForm } from "../../../types/owner.types";
import { ExpandMore as ExpandMoreIcon, PhotoLibrary as PhotoLibraryIcon, MeetingRoom as MeetingRoomIcon } from "@mui/icons-material";
import ImageUploader from "./ImageUploader";

interface Props {
	form: WizardForm;
	setForm: React.Dispatch<React.SetStateAction<WizardForm>>;
	onFieldChange?: () => void;
	triggerSubmit: boolean;
	resetTrigger: () => void;
	onSuccess: () => void;
}

const StepImageBox = ({ form, setForm, onFieldChange, triggerSubmit, resetTrigger, onSuccess }: Props) => {
	const rooms = form.rooms;

	const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

	const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
		setExpandedAccordion(isExpanded ? panel : false);
	};

	// Handle submission trigger to advance to the next step
	useEffect(() => {
		if (triggerSubmit) {
			// TODO: Implement actual image upload logic using ownerApi here
			resetTrigger();
			onSuccess();
		}
	}, [triggerSubmit, resetTrigger, onSuccess]);

	return (
		<Container maxWidth="md" sx={{ py: 6 }}>
			<Paper
				elevation={0}
				sx={{
					p: { xs: 3, md: 5 },
					borderRadius: 4,
					backgroundColor: "background.paper",
					border: "1px solid rgba(255,255,255,0.08)",
					boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
				}}
			>
				<Box sx={{ mb: 6 }}>
					<Typography variant="h4" component="h1" gutterBottom>
						Property Photos
					</Typography>
					<Typography variant="body1" color="text.secondary">
						Great photos invite guests in. Upload high-quality images of your property's exterior, common areas, and specific rooms.
					</Typography>
				</Box>

				{/* Section 1: General Accommodation Gallery */}
				<Box sx={{ mb: 6 }}>
					<Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
						<PhotoLibraryIcon sx={{ mr: 1.5, color: "primary.main" }} />
						<Typography variant="h5" component="h2">
							General Property Photos
						</Typography>
					</Box>

					<Box sx={{ p: 3, backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 3, border: "1px solid rgba(255,255,255,0.03)" }}>
						<ImageUploader title="Facade, Lobby & Amenities" description="Upload photos of the building exterior, reception, pool, gym, or restaurant." />
					</Box>
				</Box>

				<Divider sx={{ my: 6, borderColor: "rgba(255,255,255,0.1)" }} />

				{/* Section 2: Room-Specific Galleries */}
				<Box sx={{ mb: 2 }}>
					<Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
						<MeetingRoomIcon sx={{ mr: 1.5, color: "secondary.main" }} />
						<Typography variant="h5" component="h2">
							Room-Specific Photos
						</Typography>
					</Box>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						Upload photos for each room type you offer. Guests want to see exactly where they will be sleeping.
					</Typography>

					{rooms.map((room, idx) => (
						<Accordion key={room.id} expanded={expandedAccordion === room.id} onChange={handleAccordionChange(idx.toString())} disableGutters elevation={0}>
							<AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "text.secondary" }} />} sx={{ px: 3, py: 1 }}>
								<Typography variant="h6" sx={{ fontSize: "1.1rem" }}>
									{room.name}
								</Typography>
							</AccordionSummary>
							<AccordionDetails sx={{ px: 3, pb: 4, pt: 1 }}>
								<ImageUploader description={room.description} />
							</AccordionDetails>
						</Accordion>
					))}
				</Box>
			</Paper>
		</Container>
	);
};

export default StepImageBox;
