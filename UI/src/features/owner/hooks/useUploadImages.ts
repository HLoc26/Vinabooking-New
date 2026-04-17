import { useMutation } from "@tanstack/react-query";
import { uploadAccommodationImages, uploadRoomImages } from "../services/ownerApi";
import type { ImageItem } from "../types/owner.types";

interface UploadImagesPayload {
	accommodationId: string;
	images: ImageItem[];
}

export const useUploadImages = () => {
	return useMutation<void, Error, UploadImagesPayload>({
		mutationFn: async ({ accommodationId, images }) => {
			const accommodationFiles = images
				.filter((img) => img.target === "accommodation" && img.file)
				.map((img) => img.file as File);

			const roomImages = images.filter((img) => img.target === "room" && img.file && img.roomId);
			const roomFilesMap = roomImages.reduce((acc, img) => {
				const roomId = img.roomId!;
				if (!acc[roomId]) {
					acc[roomId] = [];
				}
				acc[roomId].push(img.file as File);
				return acc;
			}, {} as Record<string, File[]>);

			const uploadPromises: Promise<void>[] = [];

			if (accommodationFiles.length > 0) {
				uploadPromises.push(uploadAccommodationImages(accommodationId, accommodationFiles));
			}

			for (const [roomId, files] of Object.entries(roomFilesMap)) {
				if (files.length > 0) {
					uploadPromises.push(uploadRoomImages(roomId, files));
				}
			}

			await Promise.all(uploadPromises);
		},
		onError: (err) => {
			console.error("Upload images failed:", err.message);
		},
	});
};
