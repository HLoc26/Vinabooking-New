import { ChevronLeft, ChevronRight, Close } from "@mui/icons-material";
import { Box, Dialog, IconButton } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
import type { ImageType } from "../../types/Image";

type ImageGalleryProps = {
	galleryImages: ImageType[];
	openGallery: boolean;
	currentIndex: number;
	setCurrentIndex: Dispatch<SetStateAction<number>>;
	closeGallery: () => void;
	handlePrevImage: () => void;
	handleNextImage: () => void;
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ galleryImages, openGallery, currentIndex, setCurrentIndex, closeGallery, handlePrevImage, handleNextImage }) => {
	return (
		<Dialog
			fullScreen
			open={openGallery}
			onClose={closeGallery}
			slotProps={{
				backdrop: {
					sx: {
						backdropFilter: "blur(8px)",
						backgroundColor: "rgba(0, 0, 0, 0.85)",
					},
				},
			}}
			PaperProps={{
				sx: {
					backgroundColor: "transparent",
					boxShadow: "none",
				},
			}}
		>
			<Box sx={{ position: "relative", height: "100vh" }} onClick={closeGallery}>
				{/* Close Button */}
				<IconButton
					onClick={(e) => {
						e.stopPropagation();
						closeGallery();
					}}
					sx={{
						position: "absolute",
						top: 20,
						right: 20,
						zIndex: 9999,
						color: "white",
						bgcolor: "rgba(0,0,0,0.5)",
						"&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
					}}
				>
					<Close />
				</IconButton>

				{/* Image Counter */}
				<Box
					onClick={(e) => e.stopPropagation()}
					sx={{
						position: "absolute",
						top: 20,
						left: "50%",
						transform: "translateX(-50%)",
						zIndex: 9999,
						color: "white",
						bgcolor: "rgba(0,0,0,0.5)",
						px: 2,
						py: 1,
						borderRadius: 1,
					}}
				>
					{currentIndex + 1} / {galleryImages.length}
				</Box>

				{galleryImages.length === 0 ? (
					<Box
						sx={{
							height: "100vh",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							color: "white",
							fontSize: 18,
						}}
					>
						No images available
					</Box>
				) : (
					<>
						{/* Main Image */}
						<Box
							sx={{
								height: "100vh",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								px: 8,
							}}
						>
							<Box
								component="img"
								src={galleryImages[currentIndex].url}
								alt={`Image ${currentIndex + 1}`}
								onClick={(e) => e.stopPropagation()}
								sx={{
									maxWidth: "100%",
									maxHeight: "100%",
									objectFit: "contain",
									cursor: "default",
								}}
							/>
						</Box>

						{/* Left Arrow */}
						<IconButton
							onClick={(e) => {
								e.stopPropagation();
								handlePrevImage();
							}}
							sx={{
								position: "absolute",
								left: 20,
								top: "50%",
								transform: "translateY(-50%)",
								color: "white",
								bgcolor: "rgba(0,0,0,0.5)",
								"&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
								width: 56,
								height: 56,
							}}
						>
							<ChevronLeft sx={{ fontSize: 40 }} />
						</IconButton>

						{/* Right Arrow */}
						<IconButton
							onClick={(e) => {
								e.stopPropagation();
								handleNextImage();
							}}
							sx={{
								position: "absolute",
								right: 20,
								top: "50%",
								transform: "translateY(-50%)",
								color: "white",
								bgcolor: "rgba(0,0,0,0.5)",
								"&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
								width: 56,
								height: 56,
							}}
						>
							<ChevronRight sx={{ fontSize: 40 }} />
						</IconButton>

						{/* Thumbnails */}
						<Box
							onClick={(e) => e.stopPropagation()}
							sx={{
								position: "absolute",
								bottom: 20,
								left: "50%",
								transform: "translateX(-50%)",
								display: "flex",
								gap: 1,
								maxWidth: "90%",
								overflowX: "auto",
								px: 2,
								"&::-webkit-scrollbar": {
									height: 6,
								},
								"&::-webkit-scrollbar-thumb": {
									bgcolor: "rgba(255,255,255,0.3)",
									borderRadius: 3,
								},
							}}
						>
							{galleryImages.map((img, idx) => (
								<Box
									key={idx}
									component="img"
									src={img.url}
									alt={`Thumbnail ${idx + 1}`}
									onClick={() => setCurrentIndex(idx)}
									sx={{
										width: 80,
										height: 60,
										objectFit: "cover",
										borderRadius: 1,
										cursor: "pointer",
										border: currentIndex === idx ? "3px solid white" : "3px solid transparent",
										opacity: currentIndex === idx ? 1 : 0.6,
										transition: "all 0.2s",
										"&:hover": { opacity: 1 },
									}}
								/>
							))}
						</Box>
					</>
				)}
			</Box>
		</Dialog>
	);
};

export default ImageGallery;
