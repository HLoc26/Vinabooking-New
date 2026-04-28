import { Typography, Paper, Stepper, Step, StepLabel, StepButton } from "@mui/material";
import { STEP_META } from "../../const/StepperMetaConst";

interface CreateAccommStepperProps {
	step: number;
	completed: Set<number>;
	goToStep: (target: number) => void;
	rentalType?: string;
}

export const CreateAccommStepper: React.FC<CreateAccommStepperProps> = ({ step, completed, goToStep, rentalType }) => {
	const isEntirePlace = rentalType === "ENTIRE_PLACE";
	return (
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

					// Override label/subtitle for the rooms step when ENTIRE_PLACE
					const label = isEntirePlace && i === 3 ? "Accommodation Detail" : meta.label;
					const subtitle = isEntirePlace && i === 3 ? "Room & amenities" : meta.subtitle;

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
									{label}
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
										{subtitle}
									</Typography>
								</StepLabel>
							</StepButton>
						</Step>
					);
				})}
			</Stepper>
		</Paper>
	);
};
