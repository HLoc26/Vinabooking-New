import { useEffect, useState } from "react";
import type { Facility } from "../../../types/Accommodation";
import accommodationApi from "../service/accommodationApi";

const useFacilityList = () => {
	const [facilities, setFacilities] = useState<Facility[]>([]);

	useEffect(() => {
		(async () => {
			const res = await accommodationApi.getFacilities();
			setFacilities(res?.data ?? []);
		})();
	}, []);
	return facilities;
};
export default useFacilityList;
