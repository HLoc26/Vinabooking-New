import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import userApi from "../services/userApi";
import { useDispatch } from "react-redux";
import { updateUserSync } from "../../auth/authSlice";

// Lấy user từ cache
export const useUserProfile = () => {
	const { data, isLoading, isError, isFetching } = useQuery({
		queryKey: ["user", "profile"],
		queryFn: userApi.getMe,
		staleTime: 1000 * 60 * 10,
	});

	return { data, isLoading, isError, isFetching };
};

// Update user
export const useUpdateUserMutation = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();

	return useMutation({
		mutationFn: userApi.updateUser,
		onSuccess: (updatedUser) => {
			queryClient.setQueryData(["user", "profile"], updatedUser);
			if (!updatedUser) return;
			dispatch(updateUserSync(updatedUser));
		},
		onError: (error: unknown) => {
			const e = error as Error;
			console.log(e.message);
		},
	});
};
