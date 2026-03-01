import { Box } from "@mui/material";
import { RoomCard } from "./components/RoomCard";
import useAccommodationRooms from "../../../../hooks/useRoomsByAccommodation";

import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../../../../../app/store";
import { updateRoomQuantity } from "../../../../../../features/booking/bookingSlice";

interface Props {
	accommodationId: string;
}

export const RoomsTab = ({ accommodationId }: Props) => {
	const dispatch = useDispatch<AppDispatch>();
	const bookingInfo = useSelector((state: RootState) => state.booking);

	const { data: rooms } = useAccommodationRooms(accommodationId, bookingInfo.startDate, bookingInfo.endDate);

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
								dispatch(
									updateRoomQuantity({
										roomId: room.id,
										count: selectedQuantity + 1,
									})
								);
							}
						}}
						onDecrease={() =>
							dispatch(
								updateRoomQuantity({
									roomId: room.id,
									count: selectedQuantity - 1,
								})
							)
						}
					/>
				);
			})}
		</Box>
	);
};
