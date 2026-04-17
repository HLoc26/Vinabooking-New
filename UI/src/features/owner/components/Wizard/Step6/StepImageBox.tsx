import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Divider, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import type { WizardForm, ImageItem } from "../../../types/owner.types";
import { ExpandMore as ExpandMoreIcon, PhotoLibrary as PhotoLibraryIcon, MeetingRoom as MeetingRoomIcon } from "@mui/icons-material";
import ImageUploader from "./ImageUploader";
import { useUploadImages } from "../../../hooks/useUploadImages";
import { useGetImages } from "../../../hooks/useGetImages";
import { useDeleteImage } from "../../../hooks/useDeleteImage";

interface Props {
	form: WizardForm;
	setForm: React.Dispatch<React.SetStateAction<WizardForm>>;
	onFieldChange?: () => void;
	triggerSubmit: boolean;
	resetTrigger: () => void;
	onSuccess: () => void;
}

const StepImageBox = ({ form, setForm, onFieldChange, triggerSubmit, resetTrigger, onSuccess }: Props) => {
	const [isUploading, setIsUploading] = useState(false);
	const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);
	const { mutateAsync: uploadImages } = useUploadImages();
	const { mutateAsync: deleteImage } = useDeleteImage();

	const roomIds = form.rooms.map((r) => r.id).filter(Boolean) as string[];
	const { data: dbImages, isLoading: isFetching, refetch } = useGetImages(form.accommodationId, roomIds);

	// 1. FIXED MERGE LOGIC
	useEffect(() => {
		if (!dbImages) return;

		setForm((prev) => {
			// Get only the local files that haven't been uploaded to the DB yet
			const localOnly = prev.images.filter((img) => !!img.file);

			// Combine DB images with local files.
			// We don't need to check IDs because DB images won't have the 'file' property
			return {
				...prev,
				images: [...dbImages, ...localOnly],
			};
		});
	}, [dbImages, setForm]);

	const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
		setExpandedAccordion(isExpanded ? panel : false);
	};

	const handleAddImages = (target: "accommodation" | "room", roomId?: string, roomTempId?: string) => (files: File[]) => {
		const newImages: ImageItem[] = files.map((file) => ({
			id: crypto.randomUUID(), // This is fine for local tracking
			file,
			target,
			roomId,
			roomTempId,
		}));

		setForm((prev) => ({
			...prev,
			images: [...prev.images, ...newImages],
		}));
		onFieldChange?.();
	};

	const handleRemoveImage = async (id: string) => {
		const imageToRemove = form.images.find((img) => img.id === id);

		if (imageToRemove && !imageToRemove.file) {
			// This is a DB image, delete it from server
			try {
				await deleteImage(id);
			} catch (error) {
				console.error("Failed to delete image from server", error);
				return;
			}
		}

		setForm((prev) => ({
			...prev,
			images: prev.images.filter((img) => img.id !== id),
		}));
		onFieldChange?.();
	};

	// 2. FIXED UPLOAD LOGIC
	useEffect(() => {
		if (triggerSubmit) {
			const performUpload = async () => {
				setIsUploading(true);
				try {
					// Filter out DB images so we only upload new files
					const imagesToUpload = form.images.filter((img) => !!img.file);

					if (form.accommodationId && imagesToUpload.length > 0) {
						await uploadImages({
							accommodationId: form.accommodationId,
							images: imagesToUpload,
						});

						// Refetch to get the latest DB images with proper IDs and URLs
						const { data: newImages } = await refetch();
						if (newImages) {
							setForm((prev) => ({
								...prev,
								images: newImages,
							}));
						}
					}
					onSuccess();
				} catch (error) {
					console.error("Upload failed", error);
				} finally {
					setIsUploading(false);
					resetTrigger();
				}
			};

			performUpload();
		}
	}, [triggerSubmit]); // Removed aggressive dependencies that could cause multi-renders

	if (isFetching && form.images.length === 0) {
		return (
			<Box display="flex" justifyContent="center" py={6}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box sx={{ position: "relative" }}>
			{isUploading && (
				<Box
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						bgcolor: "rgba(0,0,0,0.5)",
						zIndex: 10,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						borderRadius: 4,
					}}
				>
					<CircularProgress />
				</Box>
			)}

			<Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
				<Box>
					<Typography variant="h5" fontWeight={800} mb={1} color="primary">
						Property Photos
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Great photos invite guests in. Upload high-quality images of your property's exterior, common areas, and specific rooms.
					</Typography>
				</Box>
			</Box>

			{/* Section 1: General Accommodation Gallery */}
			<Box sx={{ mb: 4 }}>
				<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
					<PhotoLibraryIcon sx={{ mr: 1, color: "primary.main" }} />
					<Typography variant="subtitle1" fontWeight={700}>
						General Property Photos
					</Typography>
				</Box>

				<Box sx={{ p: 2, backgroundColor: "action.hover", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
					<ImageUploader
						title="Facade, Lobby & Amenities"
						description="Upload photos of the building exterior, reception, pool, gym, or restaurant."
						images={form.images.filter((img) => img.target === "accommodation")}
						onAdd={handleAddImages("accommodation")}
						onRemove={handleRemoveImage}
					/>
				</Box>
			</Box>

			<Divider sx={{ my: 4 }} />

			{/* Section 2: Room-Specific Galleries */}
			<Box>
				<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
					<MeetingRoomIcon sx={{ mr: 1, color: "secondary.main" }} />
					<Typography variant="subtitle1" fontWeight={700}>
						Room-Specific Photos
					</Typography>
				</Box>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					Upload photos for each room type you offer. Guests want to see exactly where they will be sleeping.
				</Typography>

				{form.rooms.map((room) => (
					<Accordion
						key={room.id || room.tempId}
						expanded={expandedAccordion === (room.id || room.tempId)}
						onChange={handleAccordionChange(room.id || room.tempId)}
						disableGutters
						elevation={0}
						sx={{
							mb: 1.5,
							border: "1px solid",
							borderColor: "divider",
							borderRadius: "8px !important",
							overflow: "hidden",
							"&:before": { display: "none" },
						}}
					>
						<AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "text.secondary" }} />} sx={{ px: 2, py: 0.5, bgcolor: "action.hover" }}>
							<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
								{room.name}
							</Typography>
							<Typography variant="caption" sx={{ ml: 2, color: "text.secondary", alignSelf: "center" }}>
								{form.images.filter((img) => img.target === "room" && (img.roomId === room.id || img.roomTempId === room.tempId)).length} photos
							</Typography>
						</AccordionSummary>
						<AccordionDetails sx={{ p: 2 }}>
							<ImageUploader
								description={room.description}
								images={form.images.filter((img) => img.target === "room" && (img.roomId === room.id || img.roomTempId === room.tempId))}
								onAdd={handleAddImages("room", room.id, room.tempId)}
								onRemove={handleRemoveImage}
							/>
						</AccordionDetails>
					</Accordion>
				))}
			</Box>
		</Box>
	);
};

export default StepImageBox;
