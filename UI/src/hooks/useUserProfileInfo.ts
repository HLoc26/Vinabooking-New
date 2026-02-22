import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userApi from "../services/userApi";
import type { UserDto } from "../types/UserDto";
import type { Image } from "../types/Image";
import { authStorage } from "../features/auth/utils/authStorage";
import { updateUserSync } from "../features/auth/authSlice";
import type { RootState } from "../app/store";

const useUserProfileInfo = () => {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();

	// 1. Get User Info
	const userFromRedux = useSelector((state: RootState) => state.auth.user);
	const userInfo = userFromRedux || authStorage.getUserSync();
	const userId = userInfo?.id;

	// 2. Fetch User Avatars
	const { data: userAvatars = [] } = useQuery({
		queryKey: ["user", "avatar", userId],
		queryFn: async () => {
			if (!userId) return [];
			const res = await userApi.getUserAvatar(userId);
			if (!res.data) throw new Error("Images not found");

			const images = res.data || [];
			return images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
		},
		enabled: !!userId,
		staleTime: 1000 * 60 * 10,
	});

	// 3. Update User Info
	const updateUserInfo = useCallback(
		async (data: Partial<UserDto>) => {
			if (!userId) return;

			try {
				const updatedUserRes = await userApi.updateUser(userId, data);

				if (updatedUserRes.data) {
					const newUser = updatedUserRes.data;

					authStorage.setUser(newUser);
					dispatch(updateUserSync(newUser));
				}
			} catch (error) {
				console.error("Failed to update user info", error);
			}
		},
		[userId, dispatch]
	);

	// 4. Update Avatar
	const setUserAvatars = useCallback(
		(newAvatars: Image[] | ((prev: Image[]) => Image[])) => {
			queryClient.setQueryData<Image[]>(["user", "avatar", userId], (oldData) => {
				const currentData = oldData || [];
				if (typeof newAvatars === "function") {
					return newAvatars(currentData);
				}
				return newAvatars;
			});
		},
		[queryClient, userId]
	);

	// 5. Mutation gọi API upload file thật
	const uploadAvatarMutation = useMutation({
		mutationFn: async (file: File) => {
			if (!userId) throw new Error("User not found");
			return await userApi.uploadAvatar(userId, file);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user", "avatar", userId] });
		},
	});

	return {
		userInfo,
		userAvatars,
		updateUserInfo,
		setUserAvatars,
		uploadAvatarMutation,
	};
};

export default useUserProfileInfo;
