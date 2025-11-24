import { List, ListItemButton, ListItemIcon, ListItemText, Paper } from "@mui/material";
import { tabs } from "../constants/sideBarTabs";
import type { TabLabel } from "../types/tabs";

type SideBarProps = {
	selected: TabLabel;
	handleSelected: (label: TabLabel) => void;
};

const SideBar: React.FC<SideBarProps> = ({ selected, handleSelected }) => {
	return (
		<Paper
			elevation={1}
			sx={{
				boxSizing: "border-box",
				width: 240,
				p: 2,
				borderRadius: 3,
				border: "1px solid #e0e0e0",
				bgcolor: "background.paper",
				position: "sticky",
				top: 110,
			}}
		>
			<List disablePadding>
				{tabs.map((tab) => {
					const active = selected === tab.label;

					return (
						<ListItemButton
							key={tab.label}
							selected={active}
							onClick={() => handleSelected(tab.label)}
							sx={{
								mb: 1,
								borderRadius: 2,
								"&.Mui-selected": {
									bgcolor: "primary.main",
									color: "white",
									"& .MuiListItemIcon-root": {
										color: "white",
									},
									":hover": {
										bgcolor: "#ffba81ff",
									},
								},
								":hover": {
									color: "text.primary",
									bgcolor: "primary",
									"& .MuiListItemIcon-root": {
										color: "text.primary",
									},
								},
							}}
						>
							<ListItemIcon
								sx={{
									minWidth: 40,
									"& .MuiListItemIcon-root": {
										color: "red",
										":hover": {
											color: "red",
										},
									},
								}}
							>
								{tab.icon}
							</ListItemIcon>
							<ListItemText primary={tab.label} slotProps={{ primary: { fontWeight: active ? 600 : 400 } }} />
						</ListItemButton>
					);
				})}
			</List>
		</Paper>
	);
};

export default SideBar;
