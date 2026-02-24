import { useQuery } from "@tanstack/react-query";
import { getFacilities } from "../facilityApi";

const useFacilityList = () => {
	return useQuery({
		queryKey: ["facilities"],
		queryFn: () => getFacilities().then((r) => r.data),
		staleTime: 1000 * 60 * 60, // 1h
		placeholderData: [],
	});
};

export default useFacilityList;
