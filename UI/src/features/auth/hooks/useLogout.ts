import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { signOut } from "../authApi";
import { logoutSuccess } from "../authSlice";

export const useLogoutMutation = () => {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: signOut,
		onSuccess: () => {
			// Clear Redux
			dispatch(logoutSuccess());

			// Clear Cache React Query
			queryClient.removeQueries({ queryKey: ["user"] });
		},
		onError: (error) => {
			console.error("Logout failed", error);
			// Dù API lỗi thì phía Client vẫn nên Force Logout để tránh kẹt
			dispatch(logoutSuccess());
		},
		retry: false,
	});
};
