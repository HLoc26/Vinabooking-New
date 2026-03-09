import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";
import type { UpgradeOwnerPayload } from "../types/owner.types";
import { upgradeToOwner } from "../services/ownerApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserSync } from "../../auth/authSlice";
import { AxiosError } from "axios";

export const useUpgradeToOwner = () => {
	const queryClient = useQueryClient();
	const { pushNotification } = usePushNotificationContext();
	const user = useSelector((state: RootState) => state.auth.user);

	const dispatch = useDispatch();

	return useMutation({
		mutationFn: async (payload: UpgradeOwnerPayload) => {
			if (!user) {
				throw new Error("User is not authenticated");
			}
			const data = await upgradeToOwner(payload);
			return data;
		},
		onSuccess: () => {
			pushNotification("Welcome! You are now a Host.", "success");

			queryClient.invalidateQueries({ queryKey: ["ownerProfile", user?.id] });

			if (user) {
				dispatch(updateUserSync({ ...user, role: "ACCOMMODATION_OWNER" }));
			}
		},
		onError: (error: unknown) => {
			if (error instanceof AxiosError) {
				pushNotification(error?.response?.data?.message || "Failed to upgrade account", "error");
			}
		},
	});
};
