import { useCallback, useEffect, useState } from "react";
import type { UserDto } from "../../../types/UserDto";
import useAuthContextProvider from "../../../context/AuthContext/hook";

const useUserProfileInfo = () => {
	const [userInfo, setUserInfo] = useState<UserDto | null>(null);
	const [userAvatarUrl, setUserAvatarUrl] = useState<string>("");
	const { getCurrentUser } = useAuthContextProvider();

	useEffect(() => {
		const user = getCurrentUser();
		console.log(user);
		setUserInfo(user);
	}, [getCurrentUser]);

	const updateUserInfo = useCallback(<K extends keyof UserDto>(key: K, value: UserDto[K]) => {
		setUserInfo((prev) => {
			if (!prev) return prev;

			return {
				...prev,
				[key]: value,
			};
		});
	}, []);

	return { userInfo, userAvatarUrl, updateUserInfo, setUserAvatarUrl };
};

export default useUserProfileInfo;
