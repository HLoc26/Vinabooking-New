import { useEffect } from "react";
import { Box, TextField, CircularProgress, Typography } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useCreateBasicAccom } from "../../../hooks/useCreateBasicAccom";
import { useUpdateBasicAccom } from "../../../hooks/useUpdateBasicAccom";
import { getBasicInfo } from "../../../services/ownerApi";

import type { WizardForm, CreateAccommodationPayload, UpdateAccommodationPayload } from "../../../types/owner.types";

interface Props {
	form: WizardForm;
	setForm: React.Dispatch<React.SetStateAction<WizardForm>>;
	triggerSubmit: boolean;
	resetTrigger: () => void;
	onSuccess: () => void;
}

interface BasicInfoFormValues {
	name: string;
	description: string;
}

//Toggle between word count and character count, if true => word count, false => character count
const USE_WORD_COUNT = false;
//Limit=150 words
const LIMIT = 150;

const StepBasicInfoBox = ({ form, setForm, triggerSubmit, resetTrigger, onSuccess }: Props) => {
	const { mutate: createMutate, isPending: isCreating } = useCreateBasicAccom();
	const { mutate: updateMutate, isPending: isUpdating } = useUpdateBasicAccom(form.accommodationId ?? "");

	const {
		register,
		handleSubmit,
		reset,
		watch,
		control,
		formState: { isDirty },
	} = useForm<BasicInfoFormValues>({
		defaultValues: {
			name: form.name,
			description: form.description,
		},
	});

	const watchedName = watch("name");
	const watchedDescription = watch("description");

	// 👉 Sync to parent
	useEffect(() => {
		setForm((prev) => ({
			...prev,
			name: watchedName,
			description: watchedDescription,
		}));
	}, [watchedName, watchedDescription]);

	// 👉 Fetch cached data
	const { data: cachedData, isLoading: isFetching } = useQuery({
		queryKey: ["accommodation", form.accommodationId, "basic"],
		queryFn: () => getBasicInfo(form.accommodationId!),
		enabled: !!form.accommodationId,
		staleTime: 5 * 60 * 1000,
	});

	useEffect(() => {
		if (cachedData) {
			reset({
				name: cachedData.name,
				description: cachedData.description,
			});
		}
	}, [cachedData]);

	// 👉 Centralized count logic (used for submit blocking)
	const getCount = (value: string) => {
		if (!value) return 0;

		if (USE_WORD_COUNT) {
			return value.trim() ? value.trim().split(/\s+/).length : 0;
		}

		// 👉 Character count (toggle by switching USE_WORD_COUNT)
		return value.length;
	};

	const currentCount = getCount(watchedDescription || "");
	const isOverLimit = currentCount > LIMIT;

	// 👉 Submit handler
	useEffect(() => {
		if (!triggerSubmit) return;

		handleSubmit((values) => {
			if (isOverLimit) {
				resetTrigger();
				return;
			}

			// ── CREATE ──
			if (!form.accommodationId) {
				if (!form.rentalType || !form.accommodationType) {
					resetTrigger();
					return;
				}

				const payload: CreateAccommodationPayload = {
					rentalType: form.rentalType,
					type: form.accommodationType,
					name: values.name,
					description: values.description,
				};

				createMutate(payload, {
					onSuccess: (data) => {
						setForm((prev) => ({
							...prev,
							accommodationId: data.id,
							name: data.name,
							description: data.description ?? "",
						}));

						reset({
							name: data.name,
							description: data.description ?? "",
						});

						onSuccess();
					},
					onSettled: resetTrigger,
				});
				return;
			}

			// ── NO CHANGE ──
			if (!isDirty) {
				resetTrigger();
				onSuccess();
				return;
			}

			// ── UPDATE ──
			const payload: UpdateAccommodationPayload = {
				name: values.name,
				description: values.description,
			};

			updateMutate(payload, {
				onSuccess: (data) => {
					setForm((prev) => ({
						...prev,
						name: data.name,
						description: data.description ?? "",
					}));

					reset({
						name: data.name,
						description: data.description ?? "",
					});

					onSuccess();
				},
				onSettled: resetTrigger,
			});
		})();
	}, [triggerSubmit, isOverLimit]);

	const isPending = isCreating || isUpdating;

	// ── Loading ──
	if (isFetching) {
		return (
			<Box display="flex" justifyContent="center" py={6}>
				<CircularProgress size={32} />
			</Box>
		);
	}

	// ── UI ──
	return (
		<Box display="flex" flexDirection="column" gap={3}>
			<Box>
				<Typography variant="h6" fontWeight={700}>
					Basic Information
				</Typography>
				<Typography variant="body2" color="text.secondary" mt={0.5}>
					Fill in your property name and a brief description to attract potential guests.
				</Typography>
			</Box>

			<TextField label="Property Name" {...register("name")} fullWidth disabled={isPending} />

			<Box>
				<Typography variant="h6" fontWeight={700}>
					Description
				</Typography>
				<Typography variant="body2" color="text.secondary" mt={0.5}>
					Add a short description of your property. Highlight key features and amenities to entice guests. (Max {LIMIT} {USE_WORD_COUNT ? "words" : "characters"})
				</Typography>
				<Box mt={1.5} />
				<Controller
					name="description"
					control={control}
					render={({ field }) => {
						const value = field.value || "";

						const count = getCount(value);
						const overLimit = count > LIMIT;
						return (
							<TextField
								{...field}
								label="Description"
								multiline
								rows={4}
								fullWidth
								disabled={isPending}
								error={overLimit}
								helperText={`${count}/${LIMIT} ${USE_WORD_COUNT ? "words" : "characters"}`}
								slotProps={{
									formHelperText: {
										sx: {
											textAlign: "right",
											marginLeft: 0,
											color: overLimit ? "error.main" : "text.secondary",
										},
									},
								}}
							/>
						);
					}}
				/>
			</Box>
		</Box>
	);
};

export default StepBasicInfoBox;
