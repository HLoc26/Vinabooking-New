import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";
import { loginSuccess } from "../../auth/authSlice";
import type { UserDto } from "../../user/types/UserDto";

export const useOAuthCallback = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const { pushNotification } = usePushNotificationContext();

	const mutation = useMutation({
		mutationFn: async () => {
			const params = new URLSearchParams(window.location.search);
			const message = params.get("message");

			// Nếu có lỗi từ URL (redirect từ /oauth/error)
			if (message) {
				throw new Error(decodeURIComponent(message));
			}

			const accessToken = params.get("accessToken");
			const idToken = params.get("idToken");
			const userRaw = params.get("user");

			if (!accessToken || !idToken || !userRaw) {
				throw new Error("Invalid or missing OAuth response.");
			}

			// Parse user data từ URL
			const user: UserDto = JSON.parse(decodeURIComponent(userRaw));

			return { accessToken, user };
		},
		onSuccess: (data) => {
			// 1. Dispatch Redux (tự động xử lý luôn authStorage bên trong slice)
			dispatch(loginSuccess({ token: data.accessToken, user: data.user }));

			// 2. Cập nhật ngay cache React Query để UI (Navbar) thay đổi ngay lập tức
			queryClient.setQueryData(["user", "profile"], data.user);

			// 3. Thông báo và điều hướng
			pushNotification("Successfully logged in with Google!", "success");
			navigate("/", { replace: true });
		},
		onError: (error: Error) => {
			pushNotification(error.message, "error");
			navigate("/auth/login", { replace: true });
		},
	});

	// Tự động chạy mutation 1 lần khi hook được gọi (mount component)
	useEffect(() => {
		if (!mutation.isPending && !mutation.isSuccess && !mutation.isError) {
			mutation.mutate();
		}
	}, [mutation]);

	return {
		loading: mutation.isPending,
		error: mutation.error?.message || null,
	};
};
