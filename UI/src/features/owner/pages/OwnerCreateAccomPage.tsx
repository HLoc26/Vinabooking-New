import { useState } from "react";
import { Box, Button, Typography, Paper, Divider, Stepper, Step, StepButton, Alert } from "@mui/material";
import StepRentalTypeBox from "../components/Wizard/Step1/StepRentalTypeBox";
import StepAccommodationTypeBox from "../components/Wizard/Step2/StepAccommodationTypeBox";
import StepAddressBox from "../components/Wizard/Step3/StepAddressBox";
import StepFacilityBox from "../components/Wizard/Step4/StepFacilityBox";
import StepRoomsBox from "../components/Wizard/Step5/StepRoomBox";
import { type WizardForm } from "../types/owner.types";
import { ERentalType, EAccommodationType } from "../../accommodation/types/accommodation.types";

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = ["Rental Type", "Property Type", "Location", "Facilities", "Rooms"];

// Navigating forward validates the current step before proceeding.
// Navigating backward or to a completed step is always free.
function validateStep(step: number, form: WizardForm): string | null {
	switch (step) {
		case 0:
			if (!form.rentalType) return "Please select a rental type to continue.";
			return null;
		case 1:
			if (!form.accommodationType) return "Please select an accommodation type to continue.";
			return null;
		case 2: {
			const a = form.address;
			if (!a.fullAddress) return "Please search or pin a location on the map.";
			if (!a.street) return "Street / House Number is required.";
			if (!a.ward) return "Ward / Suburb is required.";
			if (!a.district) return "District is required.";
			if (!a.city) return "City / Province is required.";
			if (!a.country) return "Country is required.";
			if (!a.latitude || !a.longitude) return "Please confirm the location on the map (latitude/longitude missing).";
			return null;
		}
		default:
			return null;
	}
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const OwnerCreateAccomPage = () => {
	const [step, setStep] = useState(0);
	const [completed, setCompleted] = useState<Set<number>>(new Set());
	const [validationError, setValidationError] = useState<string | null>(null);

	const [form, setForm] = useState<WizardForm>({
		rentalType: "",
		accommodationType: "",
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
	});

	// ── Navigation ──────────────────────────────────────────────────────────────

	// Clicking a stepper label or the Next button both go through here.
	// Going backward / to an already-completed step: always allowed.
	// Going forward: validate every step between current and target.
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
				setStep(s); // land on the failing step
				return;
			}
			setCompleted((prev) => new Set(prev).add(s));
		}

		setValidationError(null);
		setStep(target);
	};

	const next = () => goToStep(step + 1);
	const back = () => {
		setValidationError(null);
		setStep((s) => Math.max(s - 1, 0));
	};

	// ── Form handlers ───────────────────────────────────────────────────────────

	// When rental type changes, reset accommodation type so step 2 is always
	// consistent with the AccommodationToRentalMap grouping.
	const handleRentalChange = (val: ERentalType) => {
		setValidationError(null);
		setForm((prev) => ({
			...prev,
			rentalType: val,
			accommodationType: "",
		}));
	};

	const handleAccommodationChange = (val: EAccommodationType) => {
		setValidationError(null);
		setForm((prev) => ({ ...prev, accommodationType: val }));
	};

	// ── Render ──────────────────────────────────────────────────────────────────

	const renderStep = () => {
		switch (step) {
			case 0:
				return <StepRentalTypeBox value={form.rentalType as ERentalType | ""} onChange={handleRentalChange} />;
			case 1:
				return <StepAccommodationTypeBox rentalType={form.rentalType as ERentalType | ""} value={form.accommodationType as EAccommodationType | ""} onChange={handleAccommodationChange} />;
			case 2:
				return <StepAddressBox form={form} setForm={setForm} onFieldChange={() => setValidationError(null)} />;
			case 3:
				return <StepFacilityBox form={form} setForm={setForm} />;
			case 4:
				return <StepRoomsBox form={form} setForm={setForm} />;
			default:
				return null;
		}
	};

	const isLastStep = step === STEPS.length - 1;

	return (
		<Box sx={{ mx: "auto", mt: 5, px: 3, maxWidth: 960, pb: 8 }}>
			<Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
				{/* Header */}
				<Typography variant="h5" fontWeight={700} mb={1}>
					List Your Property
				</Typography>
				<Typography variant="body2" color="text.secondary" mb={3}>
					Fill in the details below to publish your accommodation.
				</Typography>

				{/* Clickable Stepper — completed steps and backward navigation are always free */}
				<Stepper nonLinear activeStep={step} sx={{ mb: 4 }} alternativeLabel>
					{STEPS.map((label, i) => (
						<Step key={label} completed={completed.has(i)}>
							<StepButton onClick={() => goToStep(i)} sx={{ borderRadius: 2 }}>
								{label}
							</StepButton>
						</Step>
					))}
				</Stepper>

				<Divider sx={{ mb: 4 }} />

				{/* Validation Error */}
				{validationError && (
					<Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
						{validationError}
					</Alert>
				)}

				{/* Step Content */}
				{renderStep()}

				{/* Navigation */}
				<Box mt={5} display="flex" justifyContent="space-between" alignItems="center">
					<Button variant="outlined" disabled={step === 0} onClick={back} sx={{ minWidth: 100, borderRadius: 2 }}>
						Back
					</Button>

					<Typography variant="caption" color="text.disabled">
						Step {step + 1} of {STEPS.length}
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
	);
};

export default OwnerCreateAccomPage;
