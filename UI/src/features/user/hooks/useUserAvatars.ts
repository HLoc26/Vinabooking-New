import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useCallback, useMemo } from "react";
import userApi from "../services/userApi";
import type { RootState } from "../../../app/store";
import type { Image } from "../../../types/Image";

export const useUserAvatars = () => {
	const queryClient = useQueryClient();
	const user = useSelector((state: RootState) => state.auth.user);
	const userId = user?.id;

	const { data: userAvatars = [], isLoading } = useQuery({
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

	// Hàm set cache thủ công (Optimistic Update)
	const setUserAvatars = useCallback(
		(newAvatars: Image[] | ((prev: Image[]) => Image[])) => {
			queryClient.setQueryData<Image[]>(["user", "avatar", userId], (oldData) => {
				const currentData = oldData || [];
				return typeof newAvatars === "function" ? newAvatars(currentData) : newAvatars;
			});
		},
		[queryClient, userId]
	);

	// Tính toán Avatar URL hiện tại (Thumbnail hoặc Full)
	const currentAvatarUrl = useMemo(() => {
		const currentAvatar = userAvatars?.[0];
		const thumbnailVariant = currentAvatar?.variants?.find((v: { variant: string; url: string }) => v.variant === "THUMBNAIL");
		return thumbnailVariant?.url || currentAvatar?.url;
	}, [userAvatars]);

	return { userAvatars, currentAvatarUrl, isLoading, setUserAvatars };
};
