import { Paper, List, ListItemButton, ListItemText } from "@mui/material";

export default function AddressSuggestions({ items, onSelect }: any) {
	if (!items || items.length === 0) return null;

	return (
		<Paper
			elevation={4}
			sx={{
				position: "absolute",
				top: "100%",
				left: 0,
				right: 0,
				zIndex: 1000,
				mt: 1,
				// 🎨 Style: Grey background + Primary color border
				backgroundColor: "#0a0909",
				border: "2px solid",
				borderColor: "primary.main",
				maxHeight: 250,
				overflow: "auto",
			}}
		>
			<List disablePadding>
				{items.map((item: any, i: number) => (
					<ListItemButton key={i} onClick={() => onSelect(item)} divider>
						<ListItemText
							primary={item.display_name}
							// ✅ Fixed: Using slotProps instead of deprecated primaryTypographyProps
							slotProps={{
								primary: {
									fontSize: "0.875rem",
									color: "text.primary",
								},
							}}
						/>
					</ListItemButton>
				))}
			</List>
		</Paper>
	);
}
