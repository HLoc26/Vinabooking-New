import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { setOwnerProfile } from "../../features/auth/authSlice";
import { useOwnerInfo } from "../../features/owner/hooks/useOwnerInfo";
import { CircularProgress, Box } from "@mui/material";
import type { AxiosError } from "axios";
import { usePushNotificationContext } from "../../context/PushNotification/hook";

interface OwnerLayoutProps {
	children: ReactNode;
}

export const OwnerLayout: React.FC<OwnerLayoutProps> = ({ children }) => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const user = useSelector((root: RootState) => root.auth.user);
	const { pushNotification } = usePushNotificationContext();
	const { data: ownerInfo, isLoading, isError, error } = useOwnerInfo();

	// Fast-track validation: Immediately identify if the user lacks the required role
	const isNotOwner = !user || user.role !== "ACCOMMODATION_OWNER";

	useEffect(() => {
		// Redirect unauthorized users to the landing page immediately
		if (isNotOwner || !ownerInfo) {
			navigate("/owner/landing", { replace: true });
			return;
		}

		// Wait for profile data to fetch before proceeding with further checks
		if (isLoading) return;

		// Handle missing profile: Redirect to onboarding if owner details aren't found (404)
		if (isError && (error as AxiosError)?.response?.status === 404) {
			pushNotification("Please complete your profile to continue.", "info");
			navigate("/owner/onboard", { replace: true });
			return;
		}

		// Handle permission conflicts: Redirect if the backend rejects the request (403)
		if (isError && (error as AxiosError)?.response?.status === 403) {
			pushNotification("Access denied. Please check your permissions.", "error");
			navigate("/owner/landing", { replace: true });
			return;
		}

		// Sync fetched profile data with the global store
		if (ownerInfo) {
			dispatch(setOwnerProfile(ownerInfo));
		}
	}, [isNotOwner, ownerInfo, isLoading, isError, error, navigate, dispatch, pushNotification]);

	// UI Guard: Prevent flickering by returning null while redirecting unauthorized users
	if (isNotOwner) {
		return null;
	}

	// Loading State: Show a spinner while the owner's profile is being fetched
	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
				<CircularProgress />
			</Box>
		);
	}

	// Final Guard: Ensure profile data is present before rendering protected children
	if (!ownerInfo) return null;

	return <>{children}</>;
};
