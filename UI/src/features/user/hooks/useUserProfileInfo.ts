import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userApi from "../services/userApi";
import type { UserDto } from "../types/UserDto";
import type { Image } from "../../../types/Image";
import { authStorage } from "../../../features/auth/utils/authStorage";
import { updateUserSync } from "../../../features/auth/authSlice";
import type { RootState } from "../../../app/store";

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

			const images = await userApi.getUserAvatar(userId);
			if (!images) throw new Error("Images not found");

			return images.sort((a: Image, b: Image) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
		},
		enabled: !!userId,
		staleTime: 1000 * 60 * 10,
	});

	// 3. Update User Info
	const updateUserInfoMutation = useMutation({
		mutationFn: async (data: Partial<UserDto>) => {
			if (!userId) throw new Error("User not found");

			const updatedUser = await userApi.updateUser(data as { name?: string; phone?: string });
			return updatedUser;
		},
		onSuccess: (newUser) => {
			if (newUser) {
				dispatch(updateUserSync(newUser));
			}
		},
		onError: (error) => {
			console.error("Failed to update user info", error);
		},
	});

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

	const currentAvatarUrl = useMemo(() => {
		const currentAvatar = userAvatars?.[0];
		const thumbnailVariant = currentAvatar?.variants?.find((v: { variant: string; url: string }) => v.variant === "THUMBNAIL");
		return thumbnailVariant?.url || currentAvatar?.url;
	}, [userAvatars]);

	return {
		userInfo,
		userAvatars,
		currentAvatarUrl,
		updateUserInfoMutation,
		setUserAvatars,
		uploadAvatarMutation,
	};
};

export default useUserProfileInfo;
