import React from "react";
import { Box, Menu } from "@mui/material";
import { Counter } from "./Counter";
import type { Guests } from "../../../../../search/types/Query";

export interface GuestMenuProps {
	open: boolean;
	anchorEl: HTMLElement | null;
	guests: Guests;
	onGuestsChange: (guests: Guests) => void;
	onClose: () => void;
}

export const GuestMenu: React.FC<GuestMenuProps> = ({ open, anchorEl, guests, onGuestsChange, onClose }) => {
	if (!open) return null;

	return (
		<Menu
			open={open}
			onClose={onClose}
			anchorEl={anchorEl}
			anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
			slotProps={{ list: { onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => e.stopPropagation() } }}
			disableAutoFocusItem
		>
			<Box p={2} onClick={(e) => e.stopPropagation()}>
				<Counter label="Adults" value={guests.adults} onChange={(v) => onGuestsChange({ ...guests, adults: v })} min={1} />
				<Counter label="Children" value={guests.children} onChange={(v) => onGuestsChange({ ...guests, children: v })} />
				<Counter label="Rooms" value={guests.rooms} onChange={(v) => onGuestsChange({ ...guests, rooms: v })} min={1} />
			</Box>
		</Menu>
	);
};
