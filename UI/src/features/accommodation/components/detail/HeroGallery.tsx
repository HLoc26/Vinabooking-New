import { Box, Button } from "@mui/material";
import type { AccommodationImage } from "../../types/accommodation.types";

interface Props {
	images: AccommodationImage[];
	onOpenGallery: () => void;
}

export const HeroGallery = ({ images, onOpenGallery }: Props) => {
	if (images.length === 0) return null;

	return (
		<Box
			sx={{
				position: "relative",
				height: { xs: 300, sm: 400, md: 500 },
				borderRadius: 2,
				overflow: "hidden",
				display: "grid",
				gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr" },
				gridTemplateRows: { xs: "1fr", md: "1fr 1fr" },
				gap: 1,
			}}
		>
			{images.slice(0, 5).map((img, idx) => (
				<Box
					key={img.id}
					onClick={onOpenGallery}
					sx={{
						cursor: "pointer",
						bgcolor: "#e0e0e0",
						position: "relative",
						gridColumn: idx === 0 ? { xs: "1", md: "1 / 2" } : "auto",
						gridRow: idx === 0 ? { xs: "1", md: "1 / 3" } : "auto",
						display: idx > 0 ? { xs: "none", md: "block" } : "block",

						"&::before": {
							content: '""',
							position: "absolute",
							inset: 0,
							bgcolor: "transparent",
							transition: "background-color 0.3s",
							zIndex: 1,
						},
						"&:hover": {
							"&::before": { bgcolor: "rgba(0,0,0,0.2)" },
						},

						...(idx === 4 &&
							images.length > 5 && {
								"&::after": {
									content: `"${`+${images.length - 5} photos`}"`,
									position: "absolute",
									top: "50%",
									left: "50%",
									transform: "translate(-50%, -50%)",
									color: "white",
									fontSize: "1.2rem",
									fontWeight: "bold",
									zIndex: 2,
									textShadow: "0 2px 4px rgba(0,0,0,0.5)",
								},
							}),
					}}
				>
					<img
						src={img.url || "https://via.placeholder.com/800x600"}
						alt={`Photo ${idx + 1}`}
						loading={idx === 0 ? "eager" : "lazy"}
						style={{
							width: "100%",
							height: "100%",
							objectFit: "cover",
							display: "block",
						}}
					/>
				</Box>
			))}

			<Button
				variant="contained"
				onClick={onOpenGallery}
				sx={{
					position: "absolute",
					bottom: 16,
					right: 16,
					bgcolor: "white",
					color: "black",
					fontWeight: 600,
					boxShadow: 2,
					"&:hover": { bgcolor: "#f5f5f5" },
				}}
			>
				Show all {images.length} photos
			</Button>
		</Box>
	);
};
