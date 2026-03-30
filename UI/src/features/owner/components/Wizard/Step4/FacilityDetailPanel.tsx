import { Box, Typography, Paper, Chip } from "@mui/material";
import type { WizardForm, FacilityConfig } from "../../../types/owner.types";
import { FacilityDetailRow } from "./FacilityDetailRow";

interface FacilityPanelProps {
	form: WizardForm;
	setForm: React.Dispatch<React.SetStateAction<WizardForm>>;
	// expandedId is lifted here so StepFacilityBox can auto-expand on select
	expandedId: string | null;
	setExpandedId: React.Dispatch<React.SetStateAction<string | null>>;
}

const FacilityDetailPanel: React.FC<FacilityPanelProps> = ({ form, setForm, expandedId, setExpandedId }) => {
	const updateFacility = (id: string, patch: Partial<Pick<FacilityConfig, "fee" | "note">>) => {
		setForm((prev) => ({
			...prev,
			facilities: prev.facilities.map((f) => (f.id === id ? { ...f, ...patch } : f)),
		}));
	};

	const removeFacility = (id: string) => {
		setForm((prev) => ({
			...prev,
			facilities: prev.facilities.filter((f) => f.id !== id),
		}));
		if (expandedId === id) setExpandedId(null);
	};

	return (
		<Paper
			elevation={0}
			sx={{
				width: 280,
				flexShrink: 0,
				borderRadius: 3,
				border: "1px solid",
				borderColor: "divider",
				overflow: "hidden",
				position: "sticky",
				top: 24,
			}}
		>
			{/* Header */}
			<Box
				sx={{
					px: 2,
					py: 1.5,
					borderBottom: "1px solid",
					borderColor: "divider",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Typography variant="subtitle2" fontWeight={700}>
					Selected Facilities
				</Typography>
				{form.facilities.length > 0 && <Chip label={form.facilities.length} size="small" color="primary" />}
			</Box>

			{/* Empty state */}
			{form.facilities.length === 0 && (
				<Box px={2} py={4} textAlign="center">
					<Typography variant="body2" color="text.disabled">
						No facilities selected yet.
					</Typography>
					<Typography variant="caption" color="text.disabled">
						Pick tiles on the left to add them here.
					</Typography>
				</Box>
			)}

			{/* Rows in selection order */}
			<Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: form.facilities.length > 0 ? 1.5 : 0 }}>
				{form.facilities.map((f) => (
					<FacilityDetailRow
						key={f.id}
						facility={f}
						isExpanded={expandedId === f.id}
						onToggle={() => setExpandedId((prev) => (prev === f.id ? null : f.id))}
						onUpdate={(patch) => updateFacility(f.id, patch)}
						onRemove={() => removeFacility(f.id)}
					/>
				))}
			</Box>
		</Paper>
	);
};

export default FacilityDetailPanel;
