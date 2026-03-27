import { Box, Typography, Paper } from "@mui/material";
import { useCallback } from "react";

type Props = {
	form: any;
};

const StepImageBox = ({ form }: Props) => {
	// ─── Utils ─────────────────────────────────────────────

	const chunkFiles = (files: File[], size = 10) => {
		const chunks: File[][] = [];
		for (let i = 0; i < files.length; i += size) {
			chunks.push(files.slice(i, i + size));
		}
		return chunks;
	};

	const uploadImages = async (url: string, files: File[]) => {
		const chunks = chunkFiles(files, 10);

		for (const chunk of chunks) {
			const formData = new FormData();

			chunk.forEach((file) => {
				formData.append("files", file);
			});

			await fetch(url, {
				method: "POST",
				body: formData,
			});
		}
	};

	// ─── Drop handlers ─────────────────────────────────────

	const handleAccommodationDrop = useCallback(
		async (e: React.DragEvent) => {
			e.preventDefault();

			const files = Array.from(e.dataTransfer.files);

			if (!form.accommodationId) {
				alert("Accommodation must be created first.");
				return;
			}

			await uploadImages(`/images/accommodation/${form.accommodationId}`, files);
		},
		[form.accommodationId]
	);

	const handleRoomDrop = useCallback(async (e: React.DragEvent, roomId: string) => {
		e.preventDefault();

		const files = Array.from(e.dataTransfer.files);

		await uploadImages(`/images/room/${roomId}`, files);
	}, []);

	// ─── UI ────────────────────────────────────────────────

	return (
		<Box>
			<Typography variant="h6" fontWeight={700} mb={2}>
				Upload Images
			</Typography>

			{/* ── Accommodation Upload ───────────────── */}
			<Paper
				onDrop={handleAccommodationDrop}
				onDragOver={(e) => e.preventDefault()}
				sx={{
					p: 4,
					border: "2px dashed",
					borderColor: "primary.main",
					borderRadius: 3,
					textAlign: "center",
					mb: 4,
					cursor: "pointer",
				}}
			>
				<Typography fontWeight={600}>Drop images for main property here</Typography>
				<Typography variant="caption">(Max 10 per request — auto chunked)</Typography>
			</Paper>

			{/* ── Room Uploads ───────────────────────── */}
			{form.rooms.map((room: any) => (
				<Paper
					key={room.id}
					onDrop={(e) => handleRoomDrop(e, room.id)}
					onDragOver={(e) => e.preventDefault()}
					sx={{
						p: 3,
						border: "2px dashed",
						borderColor: "divider",
						borderRadius: 3,
						textAlign: "center",
						mb: 2,
						cursor: "pointer",
					}}
				>
					<Typography fontWeight={600}>Room: {room.name || room.id}</Typography>
					<Typography variant="caption">Drop room images here</Typography>
				</Paper>
			))}
		</Box>
	);
};

export default StepImageBox;
