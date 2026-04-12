import { useState } from "react";
import { Box, Button, Typography, Paper, Alert } from "@mui/material";

import PreWizardPage from "../components/PreWizard/PreWizardPage";
import StepBasicInfoBox from "../components/Wizard/Step2/StepBasicInfoBox";
import StepAddressBox from "../components/Wizard/Step3/StepAddressBox";
import StepFacilityBox from "../components/Wizard/Step4/StepFacilityBox";
import StepRoomsBox from "../components/Wizard/Step5/StepRoomBox";
// import StepImageBox from "../components/Wizard/Step6/StepImageBox";

import { type WizardForm } from "../types/owner.types";
import { ERentalType, EAccommodationType } from "../../accommodation/types/accommodation.types";
import { CreateAccommStepper } from "../components/Wizard/CreateAccommStepper";
import { STEP_META } from "../const/StepperMetaConst";

// ─── VALIDATION (Merged from V1) ──────────────────────────────────────────────

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
			if (a.latitude == null || a.longitude == null) return "Please confirm map location.";
			return null;
		}

		case 3: {
			// Entire Place skips client-side list validation because it saves inline
			if (form.rentalType === "ENTIRE_PLACE") return null;
			if (form.rooms.length === 0) return "Please add at least one room.";

			if (form.rentalType === "SHARED_ROOM") {
				for (const room of form.rooms) {
					const hasMissingPrice = room.beds.some((bed) => bed.price === undefined || bed.price === null || bed.price <= 0);
					if (hasMissingPrice) {
						return `In a Shared Room, every bed must have a price. Check "${room.name || "Room"}".`;
					}
				}
			}
			return null;
		}
		default:
			return null;
	}
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

const OwnerCreateAccomPage = () => {
	const [preWizardDone, setPreWizardDone] = useState(false);
	const [step, setStep] = useState(0);
	const [completed, setCompleted] = useState<Set<number>>(new Set());
	const [validationError, setValidationError] = useState<string | null>(null);

	// V2 triger for Step 0, 1, 2
	const [triggerSubmit, setTriggerSubmit] = useState(false);

	// V1 trigger for Step 3 (Rooms)
	const [triggerRoomSave, setTriggerRoomSave] = useState(false);

	const [form, setForm] = useState<WizardForm>({
		rentalType: "" as ERentalType,
		accommodationType: "" as EAccommodationType,
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
			countryCode: "",
			placeId: "",
			postalCode: "",
		},
		facilities: [],
		rooms: [],
		images: [],
	});

	// ── Pre-wizard gate ──────────────────────────────────────────────────────────

	if (!preWizardDone) {
		return (
			<PreWizardPage
				onComplete={(rentalType, accommodationType) => {
					setForm((prev) => ({ ...prev, rentalType, accommodationType }));
					setPreWizardDone(true);
				}}
			/>
		);
	}

	// ── Navigation ──────────────────────────────────────────────────────────────

	const goToStep = (target: number) => {
		if (target < step) {
			setValidationError(null);
			setStep(target);
			return;
		}
		for (let s = 0; s < target; s++) {
			if (!completed.has(s)) {
				const error = validateStep(s, form);
				if (error) {
					setValidationError(error);
					setStep(s);
					return;
				}
			}
		}
		setValidationError(null);
		setStep(target);
	};

	const next = () => {
		const error = validateStep(step, form);
		if (error) {
			setValidationError(error);
			return;
		}

		setValidationError(null); // Xóa lỗi cũ trước khi tiến hành

		// Các bước 0, 1, 2 dùng triggerSubmit chung
		if (step === 0 || step === 1 || step === 2) {
			setTriggerSubmit(true);
			return;
		}

		// Bước 3 (Rooms)
		if (step === 3) {
			if (form.rentalType === "ENTIRE_PLACE") {
				// Chỉ Entire Place mới cần trigger gọi API từ bên trong StepRoomsBox
				setTriggerRoomSave(true);
				return;
			} else {
				// Shared/Private Room: Dữ liệu đã được lưu vào form.rooms qua Modal rồi
				// Chỉ cần chuyển bước nếu validateStep ở trên đã pass
				setCompleted((prev) => new Set(prev).add(3));
				setStep(4);
				return;
			}
		}

		// Các bước còn lại
		setCompleted((prev) => new Set(prev).add(step));
		setStep((prev) => prev + 1);
	};

	const back = () => {
		setValidationError(null);
		setStep((s) => Math.max(s - 1, 0));
	};

	// ── Step Content ─────────────────────────────────────────────────────────────

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
				return (
					<StepAddressBox
						form={form}
						setForm={setForm}
						onFieldChange={() => setValidationError(null)}
						triggerSubmit={triggerSubmit}
						resetTrigger={() => setTriggerSubmit(false)}
						onSuccess={() => {
							setCompleted((prev) => new Set(prev).add(1));
							setStep(2);
						}}
					/>
				);
			case 2:
				return (
					<StepFacilityBox
						form={form}
						setForm={setForm}
						triggerSubmit={triggerSubmit}
						resetTrigger={() => setTriggerSubmit(false)}
						onSuccess={() => {
							setCompleted((prev) => new Set(prev).add(2));
							setStep(3);
						}}
					/>
				);
			case 3:
				// Using V1 Logic for StepRoomsBox
				return (
					<StepRoomsBox
						form={form}
						setForm={setForm}
						triggerSave={triggerRoomSave}
						onSaveComplete={() => {
							setTriggerRoomSave(false);
							setCompleted((prev) => new Set(prev).add(3));
							setStep(4);
						}}
						onSaveFailed={() => setTriggerRoomSave(false)}
					/>
				);
			// case 4:
			// 	return <StepImageBox form={form} setForm={setForm} />;
			default:
				return null;
		}
	};

	const isLastStep = step === STEP_META.length - 1;

	// ── Layout (V2 Style) ───────────────────────────────────────────────────────

	return (
		<Box sx={{ mx: "auto", mt: 5, px: 3, maxWidth: 1200, pb: 8 }}>
			<Typography variant="h5" fontWeight={700} mb={0.5} px={0.5}>
				List Your Property
			</Typography>
			<Typography variant="body2" color="text.secondary" mb={3} px={0.5}>
				Fill in the details below to publish your accommodation.
			</Typography>

			<Box display="flex" gap={3} alignItems="flex-start">
				<CreateAccommStepper step={step} completed={completed} goToStep={goToStep} />

				<Box flex={1} minWidth={0}>
					<Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
						{validationError && (
							<Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
								{validationError}
							</Alert>
						)}

						{renderStep()}

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
			</Box>
		</Box>
	);
};

export default OwnerCreateAccomPage;
