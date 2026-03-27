import { useEffect } from "react";
import { Box, TextField, CircularProgress } from "@mui/material";
import { useForm } from "react-hook-form";
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

const StepBasicInfoBox = ({ form, setForm, triggerSubmit, resetTrigger, onSuccess }: Props) => {
	const { mutate: createMutate, isPending: isCreating } = useCreateBasicAccom();
	const { mutate: updateMutate, isPending: isUpdating } = useUpdateBasicAccom(form.accommodationId ?? "");

	// ── RHF ──────────────────────────────────────
	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { isDirty },
	} = useForm<BasicInfoFormValues>({
		defaultValues: { name: form.name, description: form.description },
	});
	const watchedName = watch("name");
	const watchedDescription = watch("description");
	useEffect(() => {
		setForm((prev) => ({ ...prev, name: watchedName, description: watchedDescription }));
	}, [watchedName, watchedDescription]);
	// ── Load from cache on back-navigation ───────
	const { data: cachedData, isLoading: isFetching } = useQuery({
		queryKey: ["accommodation", form.accommodationId, "basic"],
		queryFn: () => getBasicInfo(form.accommodationId!),
		enabled: !!form.accommodationId,
		staleTime: 5 * 60 * 1000, // 5 minutes — no background refetch
	});

	useEffect(() => {
		if (cachedData) {
			reset({ name: cachedData.name, description: cachedData.description });
		}
	}, [cachedData]);

	// ── Submit when parent triggers ───────────────
	useEffect(() => {
		if (!triggerSubmit) return;

		handleSubmit((values) => {
			// ── Case 1: First time — POST ─────────────
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
						setForm((prev) => ({ ...prev, accommodationId: data.id, name: data.name, description: data.description ?? "" }));
						reset({ name: data.name, description: data.description ?? "" }); // ← add this
						onSuccess();
					},
					onSettled: resetTrigger,
				});
				return;
			}

			// ── Case 2: No changes — skip API ─────────
			if (!isDirty) {
				resetTrigger();
				onSuccess();
				return;
			}

			// ── Case 3: Has changes — PATCH ───────────
			const payload: UpdateAccommodationPayload = {
				name: values.name,
				description: values.description,
			};

			updateMutate(payload, {
				onSuccess: (data) => {
					setForm((prev) => ({ ...prev, name: data.name, description: data.description ?? "" }));
					reset({ name: data.name, description: data.description ?? "" }); // ← add this
					onSuccess();
				},
				onSettled: resetTrigger,
			});
		})();
	}, [triggerSubmit]);

	// ── UI ────────────────────────────────────────
	const isPending = isCreating || isUpdating;

	if (isFetching) {
		return (
			<Box display="flex" justifyContent="center" py={6}>
				<CircularProgress size={32} />
			</Box>
		);
	}

	return (
		<Box display="flex" flexDirection="column" gap={3}>
			<TextField label="Property Name" {...register("name")} fullWidth disabled={isPending} />
			<TextField label="Description" {...register("description")} multiline rows={4} fullWidth disabled={isPending} />
		</Box>
	);
};

export default StepBasicInfoBox;
