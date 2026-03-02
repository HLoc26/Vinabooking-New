import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { signOut } from "../authApi";
import { logoutSuccess } from "../authSlice";
import { authStorage } from "../utils/authStorage";

export const useLogoutMutation = () => {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: signOut,
		onSuccess: () => {
			// 1. Clear Storage
			authStorage.clearAccessToken();
			authStorage.clearUser();

			// 2. Clear Redux
			dispatch(logoutSuccess());

			// 3. Clear Cache React Query
			queryClient.removeQueries({ queryKey: ["user"] });
		},
		onError: (error) => {
			console.error("Logout failed", error);
			// Dù API lỗi thì phía Client vẫn nên Force Logout để tránh kẹt
			authStorage.clearAccessToken();
			authStorage.clearUser();
			dispatch(logoutSuccess());
		},
	});
};
