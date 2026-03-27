import { useState } from "react";
import { Box, Button, Typography, Paper, Stepper, Step, StepLabel, StepButton, Alert } from "@mui/material";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import KingBedOutlinedIcon from "@mui/icons-material/KingBedOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import type { SvgIconComponent } from "@mui/icons-material";

import PreWizardPage from "../components/PreWizard/PreWizardPage";
import StepBasicInfoBox from "../components/Wizard/Step2/StepBasicInfoBox";
import StepAddressBox from "../components/Wizard/Step3/StepAddressBox";
import StepFacilityBox from "../components/Wizard/Step4/StepFacilityBox";
import StepRoomsBox from "../components/Wizard/Step5/StepRoomBox";
import StepImageBox from "../components/Wizard/Step6/StepImageBox";
import FacilityPanel from "../components/Wizard/Step4/FacilityPanel";

import { type WizardForm } from "../types/owner.types";
import { ERentalType, EAccommodationType } from "../../accommodation/types/accommodation.types";

// ─── Step config ──────────────────────────────────────────────────────────────

interface StepMeta {
	label: string;
	subtitle: string;
	icon: SvgIconComponent;
}

const STEP_META: StepMeta[] = [
	{ label: "Basic Info", subtitle: "Name & description", icon: DescriptionOutlinedIcon },
	{ label: "Location", subtitle: "Where it is", icon: LocationOnOutlinedIcon },
	{ label: "Facilities", subtitle: "What you offer", icon: MeetingRoomOutlinedIcon },
	{ label: "Rooms", subtitle: "Rooms & beds", icon: KingBedOutlinedIcon },
	{ label: "Photos", subtitle: "Images & cover", icon: PhotoLibraryOutlinedIcon },
];

// ─── Validation ───────────────────────────────────────────────────────────────

function validateStep(step: number, form: WizardForm): string | null {
	switch (step) {
		case 0:
			if (!form.name) return "Property name is required.";
			if (!form.description) return "Description is required.";
			return null;
		case 1: {
			const a = form.address;
			if (!a.fullAddress) return "Please select a location.";
			if (!a.street) return "Street is required.";
			if (!a.district) return "District is required.";
			if (!a.city) return "City is required.";
			if (!a.country) return "Country is required.";
			if (!a.latitude || !a.longitude) return "Please confirm map location.";
			return null;
		}
		default:
			return null;
	}
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const OwnerCreateAccomPage = () => {
	const [preWizardDone, setPreWizardDone] = useState(false);
	const [step, setStep] = useState(0);
	const [completed, setCompleted] = useState<Set<number>>(new Set());
	const [validationError, setValidationError] = useState<string | null>(null);
	const [facilityExpandedId, setFacilityExpandedId] = useState<string | null>(null);
	const [triggerSubmit, setTriggerSubmit] = useState(false);

	const [form, setForm] = useState<WizardForm>({
		rentalType: "",
		accommodationType: "",
		accommodationId: undefined,

		name: "",
		description: "",

		address: {
			fullAddress: "",
			street: "",
			ward: "",
			district: "",
			city: "",
			country: "",
			latitude: null,
			longitude: null,
		},

		facilities: [],
		rooms: [],
		images: [],
	});

	// ── Pre-wizard gate ──────────────────────────────────────────────────────────

	if (!preWizardDone) {
		return (
			<PreWizardPage
				onComplete={(rentalType: ERentalType, accommodationType: EAccommodationType) => {
					setForm((prev) => ({ ...prev, rentalType, accommodationType }));
					setPreWizardDone(true);
				}}
			/>
		);
	}

	// ── Navigation ──────────────────────────────────────────────────────────────

	const goToStep = (target: number) => {
		if (target < step || completed.has(target)) {
			setValidationError(null);
			setStep(target);
			return;
		}
		for (let s = step; s < target; s++) {
			const error = validateStep(s, form);
			if (error) {
				setValidationError(error);
				setStep(s);
				return;
			}
			setCompleted((prev) => new Set(prev).add(s));
		}
		setValidationError(null);
		setStep(target);
	};

	const next = () => {
		if (step === 0) {
			const error = validateStep(0, form);
			if (error) {
				setValidationError(error);
				return;
			}

			setTriggerSubmit(true); // always trigger — StepBasicInfoBox handles POST/PATCH/skip
			return;
		}
		goToStep(step + 1);
	};

	const back = () => {
		setValidationError(null);
		setStep((s) => Math.max(s - 1, 0));
	};

	// ── Step content ─────────────────────────────────────────────────────────────

	const renderStep = () => {
		switch (step) {
			case 0:
				return (
					<StepBasicInfoBox
						form={form}
						setForm={setForm}
						triggerSubmit={triggerSubmit}
						resetTrigger={() => setTriggerSubmit(false)}
						onSuccess={() => {
							setCompleted((prev) => new Set(prev).add(0));
							setStep(1);
						}}
					/>
				);
			case 1:
				return <StepAddressBox form={form} setForm={setForm} onFieldChange={() => setValidationError(null)} />;
			case 2:
				return <StepFacilityBox form={form} setForm={setForm} onSelect={(id) => setFacilityExpandedId((prev) => (prev === id ? null : id))} />;
			case 3:
				return <StepRoomsBox form={form} setForm={setForm} />;
			case 4:
				return <StepImageBox form={form} setForm={setForm} />;
			default:
				return null;
		}
	};

	const isLastStep = step === STEP_META.length - 1;

	// ── Layout ───────────────────────────────────────────────────────────────────

	return (
		<Box sx={{ mx: "auto", mt: 5, px: 3, maxWidth: 1600, pb: 8 }}>
			<Typography variant="h5" fontWeight={700} mb={0.5} px={0.5}>
				List Your Property
			</Typography>
			<Typography variant="body2" color="text.secondary" mb={3} px={0.5}>
				Fill in the details below to publish your accommodation.
			</Typography>

			<Box display="flex" gap={3} alignItems="flex-start">
				{/* ── Left sidebar: vertical stepper ─────────────────────────── */}
				<Paper
					elevation={0}
					sx={{
						width: 220,
						flexShrink: 0,
						p: 2,
						borderRadius: 3,
						border: "1px solid",
						borderColor: "divider",
						position: "sticky",
						top: 24,
					}}
				>
					<Stepper
						nonLinear
						activeStep={step}
						orientation="vertical"
						sx={{
							"& .MuiStepConnector-line": {
								borderColor: "divider",
								minHeight: 20,
								transition: "border-color 0.3s ease",
							},
							"& .Mui-completed .MuiStepConnector-line": {
								borderColor: "primary.main",
							},
							"& .MuiStepIcon-root": {
								color: "text.disabled",
								transition: "color 0.2s ease",
							},
							"& .MuiStepIcon-root.Mui-active": { color: "primary.main" },
							"& .MuiStepIcon-root.Mui-completed": { color: "primary.main" },
						}}
					>
						{STEP_META.map((meta, i) => {
							const isActive = step === i;
							const isCompleted = completed.has(i);
							const isClickable = i < step || isCompleted;
							const Icon = meta.icon;

							return (
								<Step key={meta.label} completed={isCompleted}>
									<StepButton
										onClick={() => goToStep(i)}
										disableRipple={!isClickable}
										sx={{
											cursor: isClickable ? "pointer" : "default",
											borderRadius: 2,
											py: 0.75,
											px: 1,
											textAlign: "left",
											transition: "background-color 0.2s ease",

											...(isClickable &&
												!isActive && {
													"&:hover": {
														bgcolor: "action.hover",
														"& .MuiStepLabel-label": { color: "primary.main" },
														"& .step-subtitle": { color: "primary.light" },
													},
												}),

											...(isActive && {
												bgcolor: "primary.50",
												borderLeft: "3px solid",
												borderColor: "primary.main",
												pl: "calc(8px - 3px)",
											}),

											"& .MuiStepLabel-root": { alignItems: "flex-start" },

											"& .MuiStepLabel-label": {
												fontWeight: isActive ? 700 : 500,
												color: isActive ? "primary.main" : isCompleted ? "text.primary" : "text.disabled",
												lineHeight: 1.2,
												transition: "color 0.2s ease",
											},

											"& .MuiStepLabel-iconContainer": {
												pr: 1.5,
											},
										}}
									>
										<StepLabel
											icon={
												<Icon
													sx={{
														fontSize: 20,
														color: isActive ? "primary.main" : isCompleted ? "primary.main" : "text.disabled",
														transition: "color 0.2s ease",
													}}
												/>
											}
										>
											{meta.label}
											<Typography
												component="span"
												className="step-subtitle"
												variant="caption"
												display="block"
												sx={{
													color: isActive ? "primary.light" : "text.disabled",
													lineHeight: 1.2,
													fontWeight: 400,
													transition: "color 0.2s ease",
												}}
											>
												{meta.subtitle}
											</Typography>
										</StepLabel>
									</StepButton>
								</Step>
							);
						})}
					</Stepper>
				</Paper>

				{/* ── Right: step content ─────────────────────────────────────── */}
				<Box flex={1} minWidth={0}>
					<Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
						{/* Validation error */}
						{validationError && (
							<Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
								{validationError}
							</Alert>
						)}

						{/* Step content */}
						{renderStep()}

						{/* Navigation */}
						<Box mt={5} display="flex" justifyContent="space-between" alignItems="center">
							<Button variant="outlined" disabled={step === 0} onClick={back} sx={{ minWidth: 100, borderRadius: 2 }}>
								Back
							</Button>

							<Typography variant="caption" color="text.disabled">
								Step {step + 1} of {STEP_META.length}
							</Typography>

							{isLastStep ? (
								<Button variant="contained" color="success" sx={{ minWidth: 140, borderRadius: 2, fontWeight: 700 }} onClick={() => alert("Submit form!")}>
									Publish Listing
								</Button>
							) : (
								<Button variant="contained" onClick={next} sx={{ minWidth: 100, borderRadius: 2, fontWeight: 600 }}>
									Next
								</Button>
							)}
						</Box>
					</Paper>
				</Box>

				{/* ── Far right: facility panel — only on step 2 ──────────────── */}
				{step === 2 && <FacilityPanel form={form} setForm={setForm} expandedId={facilityExpandedId} setExpandedId={setFacilityExpandedId} />}
			</Box>
		</Box>
	);
};

export default OwnerCreateAccomPage;
