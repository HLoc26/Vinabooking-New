import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { signOut } from "../authApi";
import { logoutSuccess } from "../authSlice";

export const useLogoutMutation = () => {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: signOut,
		onSettled: () => {
			// Always clear Redux and Storage (via authSlice)
			dispatch(logoutSuccess());

			// Always clear React Query Cache
			queryClient.clear();
		},
		retry: false,
	});
};
