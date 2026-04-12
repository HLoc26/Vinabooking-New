import React, { useRef } from "react";
import { Box, Typography, IconButton, Paper } from "@mui/material";
import { CloudUpload as CloudUploadIcon, Close as CloseIcon, Add as AddIcon } from "@mui/icons-material";
import type { ImageItem } from "../../../types/owner.types";

interface ImageUploaderProps {
	title?: string;
	description?: string;
	images: ImageItem[];
	onAdd: (files: File[]) => void;
	onRemove: (id: string) => void;
}

export default function ImageUploader({ title, description, images, onAdd, onRemove }: ImageUploaderProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			onAdd(Array.from(event.target.files));
		}
	};

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
			onAdd(Array.from(event.dataTransfer.files));
		}
	};

	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
	};

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	if (images.length === 0) {
		return (
			<Box>
				{title && (
					<Typography variant="h6" gutterBottom>
						{title}
					</Typography>
				)}
				{description && (
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						{description}
					</Typography>
				)}

				<Paper
					variant="outlined"
					sx={{
						p: 6,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						borderStyle: "dashed",
						borderWidth: 2,
						borderColor: "rgba(255,255,255,0.2)",
						backgroundColor: "rgba(255,255,255,0.02)",
						cursor: "pointer",
						transition: "all 0.2s ease-in-out",
						"&:hover": {
							borderColor: "primary.main",
							backgroundColor: "rgba(245,166,35,0.05)",
						},
					}}
					onClick={triggerFileInput}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
				>
					<CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
					<Typography variant="h6" align="center" gutterBottom>
						Drag & drop your property images here
					</Typography>
					<Typography variant="body2" color="text.secondary" align="center">
						or click to browse from your computer
					</Typography>
					<input type="file" multiple accept="image/*" hidden ref={fileInputRef} onChange={handleFileChange} />
				</Paper>
			</Box>
		);
	}

	return (
		<Box>
			{title && (
				<Typography variant="h6" gutterBottom>
					{title}
				</Typography>
			)}
			{description && (
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					{description}
				</Typography>
			)}

			<Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 2 }}>
				{images.map((img) => (
					<Box
						key={img.id}
						sx={{
							position: "relative",
							paddingTop: "100%", // 1:1 Aspect Ratio
							borderRadius: 2,
							overflow: "hidden",
							boxShadow: 3,
							// border: index === 0 ? "2px solid" : "none", // Logic for cover image can be improved
							// borderColor: "primary.main",
						}}
					>
						<img
							src={img.url || (img.file ? URL.createObjectURL(img.file) : "")}
							alt="Uploaded"
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								height: "100%",
								objectFit: "cover",
							}}
						/>

						{/* Cover Image Badge - for now we can say the first accommodation image is cover */}
						{/* {index === 0 && (
							<Box
								sx={{
									position: "absolute",
									bottom: 0,
									left: 0,
									right: 0,
									backgroundColor: "rgba(0,0,0,0.7)",
									color: "white",
									py: 0.5,
									textAlign: "center",
									fontSize: "0.75rem",
									fontWeight: "bold",
								}}
							>
								COVER IMAGE
							</Box>
						)} */}

						{/* Remove Button */}
						<IconButton
							size="small"
							onClick={() => onRemove(img.id)}
							sx={{
								position: "absolute",
								top: 4,
								right: 4,
								backgroundColor: "rgba(0,0,0,0.5)",
								color: "white",
								"&:hover": {
									backgroundColor: "rgba(244, 67, 54, 0.8)",
								},
							}}
						>
							<CloseIcon fontSize="small" />
						</IconButton>
					</Box>
				))}

				{/* Small Add More Tile */}
				<Paper
					variant="outlined"
					sx={{
						position: "relative",
						paddingTop: "100%", // 1:1 Aspect Ratio
						borderRadius: 2,
						borderStyle: "dashed",
						borderWidth: 2,
						borderColor: "rgba(255,255,255,0.2)",
						backgroundColor: "rgba(255,255,255,0.02)",
						cursor: "pointer",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						transition: "all 0.2s ease-in-out",
						"&:hover": {
							borderColor: "primary.main",
							backgroundColor: "rgba(245,166,35,0.05)",
						},
					}}
					onClick={triggerFileInput}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
				>
					<Box
						sx={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<AddIcon sx={{ fontSize: 32, color: "text.secondary", mb: 1 }} />
						<Typography variant="body2" color="text.secondary" fontWeight="bold">
							Add more
						</Typography>
					</Box>
					<input type="file" multiple accept="image/*" hidden ref={fileInputRef} onChange={handleFileChange} />
				</Paper>
			</Box>
		</Box>
	);
}
