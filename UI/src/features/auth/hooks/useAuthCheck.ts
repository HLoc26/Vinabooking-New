import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { loginSuccess, logoutSuccess } from "../authSlice";
import { refreshToken } from "../authApi";
import { authStorage } from "../utils/authStorage";
import { parseJwt } from "../../../utils/jwt";
import type { UserDto } from "../../user/types/user.types";
import type { RootState } from "../../../app/store";
import type { CognitoIdToken } from "../types/Auth";
import userApi from "../../user/services/userApi";

export const useAuthCheck = () => {
	const dispatch = useDispatch();
	const { isAuthenticated } = useSelector((state: RootState) => state.auth);
	const hasExistingSession = !!authStorage.getAccessToken();
	// 1. Gọi Refresh Token
	const {
		data: refreshData,
		isError: isRefreshError,
		isSuccess: isRefreshSuccess,
	} = useQuery({
		queryKey: ["auth", "check"],
		queryFn: refreshToken,
		retry: false,
		staleTime: Infinity,
		enabled: !isAuthenticated && hasExistingSession,
	});

	// 2. Gọi API Check User trong DB
	const { isError: isDbError } = useQuery({
		queryKey: ["user", "me", "validation"],
		queryFn: userApi.getMe,
		retry: false,
		enabled: isRefreshSuccess,
	});

	useEffect(() => {
		// TH1: Refresh thành công
		if (isRefreshSuccess && refreshData?.data) {
			const { accessToken, idToken } = refreshData.data;
			const decoded = parseJwt<CognitoIdToken>(idToken);
			if (decoded) {
				authStorage.setAccessToken(accessToken);

				const userFromToken: UserDto = {
					id: decoded.sub,
					email: decoded.email,
					name: decoded.name,
					phone: decoded.phone_number || "",
				};

				authStorage.setUser(userFromToken);
				dispatch(loginSuccess({ token: accessToken, user: userFromToken }));
			}
		}

		// TH2: Lỗi Token hoặc Lỗi DB
		if (isRefreshError || isDbError) {
			console.log("Auth Check Failed: Invalid Token or Ghost User -> Auto Logout");
			authStorage.clearAccessToken();
			authStorage.clearUser();
			dispatch(logoutSuccess());
		}
	}, [isRefreshSuccess, isRefreshError, isDbError, refreshData, dispatch]);

	return {
		isChecking: !isAuthenticated && hasExistingSession && !isRefreshError && !isRefreshSuccess,
	};
};
