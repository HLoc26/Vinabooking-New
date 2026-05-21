import { useState, useEffect, lazy, Suspense } from "react";
import { Box, Paper, Typography, Button, CircularProgress, Divider, Chip } from "@mui/material";
import { PhotoLibraryOutlined, Check, EditOutlined, MeetingRoomOutlined, Close, Visibility as VisibilityIcon } from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";

import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";
import StepImageBox from "../../Wizard/Step6/StepImageBox";
import { getCardSx, getHeaderSx } from "../shared/CardSharedUI";

import type { WizardForm, RoomForm, RoomSummary } from "../../../types/owner.types";
import { EAccommodationType } from "../../../../accommodation/types/accommodation.types";
import type { AccommodationHydrateResponse } from "../../../services/ownerApi";

const ImageGallery = lazy(() => import("../../../../../components/shared/ImageGallery"));

type Props = Readonly<{
	accommodationId: string;
	accommodationData: AccommodationHydrateResponse;
}>;

const extractRoomsForGallery = (apiRooms: RoomSummary[]): RoomForm[] => {
	return apiRooms.map((r) => ({
		tempId: r.id,
		id: r.id,
		name: r.name,
		description: r.description || "",
		quantity: r.quantity,
		maxAdults: r.maxAdults,
		maxChildren: r.maxChildren,
		bedroomCount: r.bedroomCount,
		bathroomCount: r.bathroomCount,
		viewType: r.viewType,
		pricingType: r.pricingType,
		beds: [],
		amenities: [],
	}));
};

// =========================================================================
// READ-ONLY VIEW
// =========================================================================
const GalleryViewMode = ({ data }: { data: AccommodationHydrateResponse }) => {
	const allImages = data.images || [];
	const generalImages = allImages.filter((img) => img.target === "accommodation");

	const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
	const imageUrls = allImages.map((img) => img.url || "");

	const renderImageGrid = (images: typeof allImages) => {
		if (images.length === 0) {
			return (
				<Typography
					variant="body2"
					color="text.secondary"
					sx={{ fontStyle: "italic", p: 3, bgcolor: "rgba(255,255,255,0.01)", borderRadius: 2, border: "1px dashed rgba(255,255,255,0.1)", textAlign: "center" }}
				>
					No photos available. Click "Edit Gallery" to upload.
				</Typography>
			);
		}
		return (
			<Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 2 }}>
				{images.map((img) => {
					const absoluteIndex = allImages.findIndex((x) => x.id === img.id);

					return (
						<Box
							key={img.id}
							onClick={() => setGalleryIndex(absoluteIndex)}
							sx={{
								position: "relative",
								paddingTop: "100%",
								borderRadius: 2,
								overflow: "hidden",
								boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
								border: "1px solid rgba(255,255,255,0.05)",
								cursor: "pointer",
								transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
								"& .overlay": { opacity: 0, transition: "opacity 0.2s ease" },
								"&:hover .overlay": { opacity: 1 },
								"&:hover": { transform: "scale(1.03)", zIndex: 2, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" },
							}}
						>
							<img src={img.url} alt="Gallery item" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />

							<Box className="overlay" sx={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
								<VisibilityIcon sx={{ color: "white", fontSize: 32 }} />
							</Box>
						</Box>
					);
				})}
			</Box>
		);
	};

	const handleSetCurrentIndex = (idx: number | ((prev: number) => number)) => {
		setGalleryIndex((prev) => {
			if (prev === null) return null;
			if (typeof idx === "function") return idx(prev);
			return idx;
		});
	};

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
			<Box>
				<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
					<PhotoLibraryOutlined sx={{ mr: 1, color: "primary.main" }} />
					<Typography variant="subtitle1" fontWeight={700}>
						General Property Photos
					</Typography>
					<Chip label={`${generalImages.length} photos`} size="small" sx={{ ml: 2, height: 20, fontSize: "0.7rem", fontWeight: 600, bgcolor: "rgba(255,255,255,0.05)" }} />
				</Box>
				{renderImageGrid(generalImages)}
			</Box>

			<Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />

			<Box>
				<Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
					<MeetingRoomOutlined sx={{ mr: 1, color: "secondary.main" }} />
					<Typography variant="subtitle1" fontWeight={700}>
						Room-Specific Photos
					</Typography>
				</Box>

				{data.rooms?.map((room) => {
					const roomImages = allImages.filter((img) => img.target === "room" && img.roomId === room.id);
					return (
						<Box key={room.id} sx={{ mb: 3, p: 2.5, bgcolor: "rgba(255,255,255,0.02)", borderRadius: 3, border: "1px solid rgba(255,255,255,0.05)" }}>
							<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
								<Typography variant="subtitle2" fontWeight={600} color="text.primary">
									{room.name}
								</Typography>
								<Chip label={`${roomImages.length} photos`} size="small" variant="outlined" sx={{ ml: 1.5, height: 20, fontSize: "0.7rem", borderColor: "rgba(255,255,255,0.15)" }} />
							</Box>
							{renderImageGrid(roomImages)}
						</Box>
					);
				})}
			</Box>

			<Suspense fallback={null}>
				{galleryIndex !== null && (
					<ImageGallery
						openGallery={galleryIndex !== null}
						galleryImages={imageUrls}
						currentIndex={galleryIndex}
						setCurrentIndex={handleSetCurrentIndex}
						closeGallery={() => setGalleryIndex(null)}
						handleNextImage={() => setGalleryIndex((prev) => (prev === null ? null : (prev + 1) % imageUrls.length))}
						handlePrevImage={() => setGalleryIndex((prev) => (prev === null ? null : (prev - 1 + imageUrls.length) % imageUrls.length))}
					/>
				)}
			</Suspense>
		</Box>
	);
};

// =========================================================================
// MAIN CARD COMPONENT (WRAPPER)
// =========================================================================
export const ManageGalleryCard = ({ accommodationId, accommodationData }: Props) => {
	const queryClient = useQueryClient();
	const { pushNotification } = usePushNotificationContext();

	const [isEditing, setIsEditing] = useState(false);
	const [triggerSubmit, setTriggerSubmit] = useState(false);

	const [wizardForm, setWizardForm] = useState<WizardForm>(() => ({
		accommodationId: accommodationId,
		rentalType: accommodationData.rentalType,
		accommodationType: (accommodationData.type as EAccommodationType) || EAccommodationType.HOTEL,
		name: accommodationData.name,
		description: accommodationData.description || "",
		address: { fullAddress: "", street: "", city: "", country: "", latitude: null, longitude: null, countryCode: "", postalCode: "", placeId: "" },
		facilities: [],
		rooms: accommodationData.rooms ? extractRoomsForGallery(accommodationData.rooms) : [],
		images: [],
	}));

	useEffect(() => {
		if (accommodationData.rooms) {
			setWizardForm((prev) => ({ ...prev, rooms: extractRoomsForGallery(accommodationData.rooms) }));
		}
	}, [accommodationData.rooms]);

	const handleSuccess = () => {
		pushNotification("Photo gallery updated successfully!", "success");
		queryClient.invalidateQueries({ queryKey: ["accommodationManage", accommodationId] });
		setIsEditing(false);
	};

	return (
		<Paper elevation={0} sx={getCardSx(isEditing)}>
			<Box sx={getHeaderSx(isEditing)}>
				<Box display="flex" alignItems="center" gap={1.5}>
					<Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
						<PhotoLibraryOutlined sx={{ fontSize: "1.1rem", color: "text.secondary" }} />
					</Box>
					<Box>
						<Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} sx={{ fontSize: "0.95rem" }}>
							Photo Gallery
						</Typography>
						<Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.75rem" }}>
							{isEditing ? "Upload or remove property photos" : "Manage general property and room-specific photos"}
						</Typography>
					</Box>
				</Box>

				<Box display="flex" gap={1} alignItems="center">
					{isEditing ? (
						<>
							<Button
								variant="text"
								size="small"
								color="inherit"
								onClick={() => {
									setIsEditing(false);
									setTriggerSubmit(false);
								}}
								disabled={triggerSubmit}
								startIcon={<Close sx={{ fontSize: "0.9rem !important" }} />}
								sx={{ borderRadius: "10px", fontWeight: 600, textTransform: "none", fontSize: "0.8rem", px: 1.5, color: "text.secondary" }}
							>
								Cancel
							</Button>
							<Button
								variant="contained"
								size="small"
								color="primary"
								onClick={() => setTriggerSubmit(true)}
								disabled={triggerSubmit}
								startIcon={triggerSubmit ? <CircularProgress size={13} color="inherit" /> : <Check sx={{ fontSize: "0.9rem !important" }} />}
								sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none", fontSize: "0.8rem", px: 2, boxShadow: "none", "&:hover": { boxShadow: "none" } }}
							>
								Save changes
							</Button>
						</>
					) : (
						<Button
							variant="outlined"
							size="small"
							color="inherit"
							onClick={() => setIsEditing(true)}
							startIcon={<EditOutlined sx={{ fontSize: "0.9rem !important" }} />}
							sx={{
								borderRadius: "10px",
								fontWeight: 600,
								textTransform: "none",
								fontSize: "0.8rem",
								px: 2,
								borderColor: "rgba(255,255,255,0.15)",
								color: "text.secondary",
								"&:hover": { borderColor: "primary.main", color: "primary.main", bgcolor: "rgba(var(--mui-palette-primary-mainChannel) / 0.1)" },
							}}
						>
							Edit Gallery
						</Button>
					)}
				</Box>
			</Box>

			<Box sx={{ px: 3.5, py: 3 }}>
				{isEditing ? (
					<StepImageBox form={wizardForm} setForm={setWizardForm} triggerSubmit={triggerSubmit} resetTrigger={() => setTriggerSubmit(false)} onSuccess={handleSuccess} isManageMode={true} />
				) : (
					<GalleryViewMode data={accommodationData} />
				)}
			</Box>
		</Paper>
	);
};
