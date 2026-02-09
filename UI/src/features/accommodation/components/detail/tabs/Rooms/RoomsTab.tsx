import { Box } from "@mui/material";
import { RoomCard } from "./components/RoomCard";
import useBookingContextProvider from "../../../../../../context/BookingContext/hook";
import useRoom from "../../../../hooks/useRoom";

interface Props {
	accommodationId: string;
}

export const RoomsTab = ({ accommodationId }: Props) => {
	const { bookingInfo, updateRoomQuantity } = useBookingContextProvider();
	const { data: rooms } = useRoom(accommodationId, bookingInfo.startDate, bookingInfo.endDate);
	if (!rooms) return null;
	return (
		<Box>
			{rooms.map((room) => {
				const selectedRoom = bookingInfo.items.find((r) => r.id === room.id);
				const selectedQuantity = selectedRoom ? selectedRoom.count : 0;
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
