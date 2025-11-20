import { Box } from "@mui/material";
import { RoomCard } from "../RoomCard";
import type { AccommodationDetail } from "../../../types/accommodation.types";

interface Props {
	accommodation: AccommodationDetail;
	roomQuantities: Record<string, number>;
	onRoomQuantityChange: (roomId: string, qty: number) => void;
}

export const RoomsTab = ({ accommodation, roomQuantities, onRoomQuantityChange }: Props) => {
	return (
		<Box>
			{accommodation.rooms.map((room) => {
				const quantity = roomQuantities[room.id] || 0;
				const availableRooms = 10; // TODO: replace with real data

				return (
					<RoomCard
						key={room.id}
						room={room}
						quantity={quantity}
						availableRooms={availableRooms}
						onIncrease={() => onRoomQuantityChange(room.id, quantity + 1)}
						onDecrease={() => onRoomQuantityChange(room.id, quantity - 1)}
					/>
				);
			})}
		</Box>
	);
};
