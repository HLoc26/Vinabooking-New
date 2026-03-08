import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import userApi from "../services/userApi";
import { updateUserSync } from "../../auth/authSlice";
import type { UserDto } from "../types/UserDto";

export const useUpdateUser = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();

	return useMutation({
		mutationFn: async (data: Partial<UserDto>) => {
			return await userApi.updateUser(data as { name?: string; phone?: string });
		},
		onSuccess: (updatedUser) => {
			if (!updatedUser) return;

			// 1. Cập nhật cache của Query
			queryClient.setQueryData(["user", "profile"], updatedUser);

			// 2. Đồng bộ sang Redux
			dispatch(updateUserSync(updatedUser));
		},
		onError: (error: unknown) => {
			const e = error as Error;
			console.error("Failed to update user info:", e.message);
		},
	});
};
