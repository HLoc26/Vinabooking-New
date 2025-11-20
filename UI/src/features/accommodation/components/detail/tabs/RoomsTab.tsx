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
				const selectedRoom = bookingInfo.items.filter((r) => r.id == room.id)[0];
				const selectedQuantity = selectedRoom ? selectedRoom.count : 0;
				const availableRooms = 10; // TODO: replace with real data

				return (
					<RoomCard
						key={room.id}
						room={room}
						quantity={selectedQuantity}
						availableRooms={availableRooms}
						onIncrease={() => updateRoomQuantity(room.id, selectedQuantity + 1)}
						onDecrease={() => updateRoomQuantity(room.id, selectedQuantity - 1)}
					/>
				);
			})}
		</Box>
	);
};
