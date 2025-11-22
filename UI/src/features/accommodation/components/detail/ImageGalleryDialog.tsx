import { Dialog, Box, IconButton, Typography, ImageList, ImageListItem } from "@mui/material";
import { Close } from "@mui/icons-material";
import type { AccommodationImage } from "../../types/accommodation.types";

interface Props {
	open: boolean;
	onClose: () => void;
	images: AccommodationImage[];
	propertyName: string;
}

export const ImageGalleryDialog = ({ open, onClose, images, propertyName }: Props) => (
	<Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
		<Box sx={{ position: "relative", p: 2, bgcolor: "#000" }}>
			<IconButton sx={{ position: "absolute", top: 8, right: 8, bgcolor: "white" }} onClick={onClose}>
				<Close />
			</IconButton>
			<Typography variant="h6" color="white" sx={{ mb: 2, pl: 1 }}>
				{propertyName}
			</Typography>
			<ImageList cols={2} gap={8}>
				{images.map((img) => (
					<ImageListItem key={img.id}>
						<img src={img.url} alt="" style={{ borderRadius: 8 }} />
					</ImageListItem>
				))}
			</ImageList>
		</Box>
	</Dialog>
);
