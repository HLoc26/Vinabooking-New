// GuestMenu.tsx
import React from "react";
import { Box, Menu, Divider, Stack, Switch, Typography } from "@mui/material";
import { Counter } from "../components/Counter";
import type { Guests } from "../types/Guest";

export interface GuestMenuProps {
	open: boolean;
	anchorEl: HTMLElement | null;
	guests: Guests;
	hasPets: boolean;
	onGuestsChange: (guests: Guests) => void;
	onPetsChange: (has: boolean) => void;
	onClose: () => void;
}

export const GuestMenu: React.FC<GuestMenuProps> = ({ open, anchorEl, guests, hasPets, onGuestsChange, onPetsChange, onClose }) => {
	return (
		<Menu open={open} onClose={onClose} anchorEl={anchorEl} anchorOrigin={{ vertical: "bottom", horizontal: "left" }} disableAutoFocusItem MenuListProps={{ onClick: (e) => e.stopPropagation() }}>
			<Box p={2} onClick={(e) => e.stopPropagation()}>
				<Counter label="Adults" value={guests.adults} onChange={(v) => onGuestsChange({ ...guests, adults: v })} min={1} />
				<Counter label="Children" value={guests.children} onChange={(v) => onGuestsChange({ ...guests, children: v })} />
				<Counter label="Rooms" value={guests.rooms} onChange={(v) => onGuestsChange({ ...guests, rooms: v })} min={1} />

				<Divider sx={{ my: 1 }} />

				<Stack direction="row" alignItems="center" justifyContent="space-between">
					<Typography>Traveling with pets?</Typography>
					<Switch checked={hasPets} onChange={(e) => onPetsChange(e.target.checked)} />
				</Stack>
			</Box>
		</Menu>
	);
};
