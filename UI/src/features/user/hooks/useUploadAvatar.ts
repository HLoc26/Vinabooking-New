import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import userApi from "../services/userApi";
import type { RootState } from "../../../app/store";

export const useUploadAvatar = () => {
	const queryClient = useQueryClient();
	const user = useSelector((state: RootState) => state.auth.user);
	const userId = user?.id;

	return useMutation({
		mutationFn: async (file: File) => {
			if (!userId) throw new Error("User not found");
			return await userApi.uploadAvatar(userId, file);
		},
		onSuccess: () => {
			// Bắt Query fetch lại danh sách avatar mới nhất
			queryClient.invalidateQueries({ queryKey: ["user", "avatar", userId] });
		},
		onError: (error: unknown) => {
			const e = error as Error;
			console.error("Failed to upload avatar:", e.message);
		},
	});
};
