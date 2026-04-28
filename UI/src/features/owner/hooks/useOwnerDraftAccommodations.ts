import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "../../../types/Response";
import type { DraftAccommodation } from "../../accommodation/types/accommodation.types";
import { getDraftAccommodations } from "../services/ownerApi";

export const useOwnerDraftAccommodations = () => {
	return useQuery<ApiResponse<DraftAccommodation[]>, Error>({
		queryKey: ["draftAccommodations"],
		queryFn: getDraftAccommodations,
	});
};
