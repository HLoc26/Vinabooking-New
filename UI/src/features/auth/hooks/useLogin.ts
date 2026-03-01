import { useMutation } from "@tanstack/react-query";
import { login } from "../authApi";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../authSlice";
import { authStorage } from "../utils/authStorage";

export const useLogin = () => {
	const dispatch = useDispatch();
	return useMutation({
		mutationFn: login,
		onSuccess: (data) => {
			if (data.data?.accessToken && data.data.user) {
				dispatch(loginSuccess({ token: data.data?.accessToken, user: data.data.user }));
				authStorage.setAccessToken(data.data.accessToken);
				authStorage.setUser(data.data.user);
			}
		},
		onError: (error: unknown) => {
			const e = error as Error;
			console.log(e.message);
		},
	});
};
