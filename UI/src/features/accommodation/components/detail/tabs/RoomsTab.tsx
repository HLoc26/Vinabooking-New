import { Box } from "@mui/material";
import { RoomCard } from "../RoomCard";
import type { AccommodationDetail } from "../../../types/accommodation.types";
import useBookingContextProvider from "../../../../../context/BookingContext/hook";

interface Props {
	accommodation: AccommodationDetail;
}

export const RoomsTab = ({ accommodation }: Props) => {
	const { bookingInfo, updateRoomQuantity } = useBookingContextProvider();

	return (
		<Box>
			{accommodation.rooms.map((room) => {
				const selectedRoom = bookingInfo.items.find((r) => r.id === room.id);
				const selectedQuantity = selectedRoom ? selectedRoom.count : 0;
				console.log(`DEBUG Room ${room.id}:`, {
					name: room.name,
					remaining: room.remainingQuantity,
				});
				const availableRooms = room.remainingQuantity ?? 0;

				return (
					<RoomCard
						key={room.id}
						room={room}
						quantity={selectedQuantity}
						availableRooms={availableRooms}
						onIncrease={() => {
							if (selectedQuantity < availableRooms) {
								updateRoomQuantity(room.id, selectedQuantity + 1);
							}
						}}
						onDecrease={() => updateRoomQuantity(room.id, selectedQuantity - 1)}
					/>
				);
			})}
		</Box>
	);
};
