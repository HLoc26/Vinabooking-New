import { useCallback, useEffect, useState } from "react";
import type { UserDto } from "../types/UserDto";
import useAuthContextProvider from "../context/AuthContext/hook";
import userApi from "../services/userApi";
import type { Image } from "../types/Image";

const useUserProfileInfo = () => {
	const [userInfo, setUserInfo] = useState<UserDto | null>(null);
	const [userAvatars, setUserAvatars] = useState<Image[]>([]);
	const { getCurrentUser } = useAuthContextProvider();

	useEffect(() => {
		const user = getCurrentUser();
		setUserInfo(user);

		if (!user?.id) return;

		(async () => {
			if (!userInfo?.id) return;
			try {
				const res = await userApi.getUserAvatar(userInfo?.id);
				if (!res.data) {
					throw new Error("Images not found");
				}
				const avatars = res.data.images;

				const primary = avatars.filter((a) => a.isPrimary);

				setUserAvatars(primary);

				if (res.error) {
					throw new Error(res.error);
				}
			} catch (error: unknown) {
				console.error(error);
			}
		})();
	}, [getCurrentUser, userInfo?.id]);

	const updateUserInfo = useCallback(<K extends keyof UserDto>(key: K, value: UserDto[K]) => {
		setUserInfo((prev) => {
			if (!prev) return prev;

			return {
				...prev,
				[key]: value,
			};
		});
	}, []);

	return { userInfo, userAvatars, updateUserInfo, setUserAvatars };
};

export default useUserProfileInfo;
