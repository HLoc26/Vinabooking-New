import { useState } from "react";
import { Box, Button, Typography, Paper, MobileStepper } from "@mui/material";
import StepRentalTypeBox from "./StepRentalTypeBox";
import StepAccommodationTypeBox from "./StepAccommodationTypeBox";
import { ERentalType, EAccommodationType } from "../../../accommodation/types/accommodation.types";
import { usePushNotificationContext } from "../../../../context/PushNotification/hook";

interface Props {
	onComplete: (rentalType: ERentalType, accommodationType: EAccommodationType) => void;
}

const PreWizardPage = ({ onComplete }: Props) => {
	const [preStep, setPreStep] = useState(0);
	const [rentalType, setRentalType] = useState<ERentalType | "">("");
	const [accommodationType, setAccommodationType] = useState<EAccommodationType | "">("");
	const { pushNotification } = usePushNotificationContext();

	const handleNext = () => {
		if (preStep === 0) {
			if (!rentalType) {
				pushNotification("Please select a rental type.", "error");
				return;
			}
			setPreStep(1);
			return;
		}
		if (preStep === 1) {
			if (!accommodationType) {
				pushNotification("Please select a property type.", "error");
				return;
			}
			onComplete(rentalType as ERentalType, accommodationType as EAccommodationType);
		}
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				bgcolor: "background.default",
				px: 2,
			}}
		>
			<Paper
				elevation={0}
				sx={{
					maxWidth: 680,
					width: "100%",
					p: 5,
					borderRadius: 4,
					border: "1px solid",
					borderColor: "divider",
				}}
			>
				{/* Header */}
				<Typography variant="h5" fontWeight={700} mb={0.5}>
					{preStep === 0 ? "How do you rent your place?" : "What kind of place is it?"}
				</Typography>
				<Typography variant="body2" color="text.secondary" mb={4}>
					{preStep === 0 ? "This helps us tailor the listing experience for you." : "Choose the type that best describes your property."}
				</Typography>

				{/* Step content */}
				{preStep === 0 && (
					<StepRentalTypeBox
						value={rentalType}
						onChange={(val) => {
							setRentalType(val);
						}}
					/>
				)}
				{preStep === 1 && (
					<StepAccommodationTypeBox
						rentalType={rentalType}
						value={accommodationType}
						onChange={(val) => {
							setAccommodationType(val);
						}}
					/>
				)}

				{/* Navigation */}
				<Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
					<Button
						variant="outlined"
						disabled={preStep === 0}
						onClick={() => {
							setPreStep(0);
						}}
						sx={{ borderRadius: 2, minWidth: 100 }}
					>
						Back
					</Button>

					<MobileStepper
						variant="dots"
						steps={2}
						position="static"
						activeStep={preStep}
						sx={{ bgcolor: "transparent", "& .MuiMobileStepper-dot": { mx: 0.5 } }}
						nextButton={null}
						backButton={null}
					/>

					<Button variant="contained" onClick={handleNext} sx={{ borderRadius: 2, minWidth: 100, fontWeight: 600 }}>
						{preStep === 1 ? "Start Listing" : "Next"}
					</Button>
				</Box>
			</Paper>
		</Box>
	);
};

export default PreWizardPage;
