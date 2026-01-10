import { useCallback, useEffect, useState } from "react";
import type { UserDto } from "../types/UserDto";
import useAuthContextProvider from "../context/AuthContext/hook";
import userApi from "../services/userApi";
import type { Image } from "../types/Image";

const useUserProfileInfo = () => {
	const [userInfo, setUserInfo] = useState<UserDto | null>(null);
	const [userAvatars, setUserAvatars] = useState<Image[]>([]);
	const { getCurrentUser, updateUserInStorage } = useAuthContextProvider();

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

	const updateUserInfo = useCallback(
		async (data: Partial<UserDto>) => {
			if (!userInfo || !userInfo.id) return;

			const updatedUser = await userApi.updateUser(userInfo.id, data);

			if (updatedUser.data) {
				setUserInfo(updatedUser.data);
				updateUserInStorage(updatedUser.data);
			} else {
				throw new Error(updatedUser.error || "Failed to update profile");
			}
		},
		[userInfo, updateUserInStorage]
	);

	return { userInfo, userAvatars, updateUserInfo, setUserAvatars };
};

export default useUserProfileInfo;
