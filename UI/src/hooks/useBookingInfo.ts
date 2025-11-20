import { useEffect, useState } from "react";
import type { BookingContextInfo } from "../types/BookingContextInfo";
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

	const updateBookingInfo = <K extends keyof BookingContextInfo>(key: K, value: BookingContextInfo[K]) => {
		setBookingInfo((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	return { bookingInfo, updateBookingInfo };
};

export default useBookingInfo;
