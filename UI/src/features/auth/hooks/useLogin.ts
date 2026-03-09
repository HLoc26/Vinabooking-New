import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../authApi";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../authSlice";

export const useLogin = () => {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: login,
		onSuccess: (data) => {
			if (data.data?.accessToken && data.data.user) {
				dispatch(loginSuccess({ token: data.data?.accessToken, user: data.data.user }));
				queryClient.setQueryData(["user", "profile"], data.data.user);
			}
		},
		onError: (error: unknown) => {
			const e = error as Error;
			console.log(e.message);
		},
	});
};
