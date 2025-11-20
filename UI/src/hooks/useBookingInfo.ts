import { useCallback, useEffect, useState } from "react";
import type { BookingContextInfo, ItemInfo } from "../types/BookingContextInfo";
import useAuth from "./useAuth";
import type { UserDto } from "../types/UserDto";

const useBookingInfo = () => {
	const { getCurrentUser } = useAuth();
	const [user, setUser] = useState<UserDto | null>(null);

	useEffect(() => {
		const loggedIn = getCurrentUser();
		setUser(loggedIn);
	}, [getCurrentUser]);

	const [bookingInfo, setBookingInfo] = useState<BookingContextInfo>({
		accommodationId: "",
		guestCount: 1,
		items: [],
		startDate: new Date(),
		endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
		leader: {
			email: "",
			name: "",
			phone: "",
		},
	});

	// sync leader
	useEffect(() => {
		if (!user) return;

		setBookingInfo((prev) => ({
			...prev,
			leader: {
				email: user.email,
				name: user.name,
				phone: user.phone,
			},
		}));
	}, [user]);

	const updateBookingInfo = useCallback(<K extends keyof BookingContextInfo>(key: K, value: BookingContextInfo[K]) => {
		setBookingInfo((prev) => ({
			...prev,
			[key]: value,
		}));
	}, []);

	const updateRoomQuantity = (roomId: string, count: number) => {
		setBookingInfo((prev) => {
			const exists = prev.items.find((item) => item.id === roomId);
			let newItems: ItemInfo[];
			if (exists) {
				newItems = prev.items.map((item) => (item.id === roomId ? { ...item, count } : item));
			} else {
				newItems = [...prev.items, { id: roomId, itemType: "ROOM", count }];
			}
			newItems = newItems.filter((item) => item.count > 0);
			return { ...prev, items: newItems };
		});
	};

	return { bookingInfo, updateBookingInfo, updateRoomQuantity };
};

export default useBookingInfo;
