import { useQuery } from "@tanstack/react-query";
import userApi from "../services/userApi";

export const useUserProfile = () => {
	const {
		data: userInfo,
		isLoading,
		isError,
		isFetching,
	} = useQuery({
		queryKey: ["user", "profile"],
		queryFn: userApi.getMe,
		staleTime: 1000 * 60 * 10,
	});

	return { userInfo, isLoading, isError, isFetching };
};
